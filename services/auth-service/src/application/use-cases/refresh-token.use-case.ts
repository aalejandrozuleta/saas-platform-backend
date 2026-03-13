import { Inject } from '@nestjs/common';
import { TokenService } from '@application/ports/token.service.token';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { SessionCache } from '@application/ports/session-cache.port';
import {
  TOKEN_SERVICE,
  PASSWORD_HASHER,
  SESSION_CACHE
} from '@domain/token/services.tokens';
import { REFRESH_TOKEN_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

export class RefreshTokenUseCase {

  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,

    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshRepo: RefreshTokenRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,

    @Inject(SESSION_CACHE)
    private readonly sessionCache: SessionCache,
  ) { }

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw DomainErrorFactory.invalidRefreshToken();
    }

    let jti: string;

    try {
      ({ jti } = this.tokenService.verifyRefreshToken(refreshToken));
    } catch {
      throw DomainErrorFactory.invalidRefreshToken();
    }

    const stored =
      await this.refreshRepo.findByJti(jti);

    if (!stored) {
      throw DomainErrorFactory.invalidRefreshToken();
    }

    if (stored.revokedAt) {
      throw DomainErrorFactory.invalidRefreshToken();
    }

    if (stored.expiresAt < new Date()) {
      throw DomainErrorFactory.invalidRefreshToken();
    }

    const valid = await this.passwordHasher.verify(
      stored.tokenHash,
      refreshToken,
    );

    if (!valid) {
      throw DomainErrorFactory.invalidRefreshToken();
    }

    const isSessionActive =
      await this.sessionCache.isSessionActive(stored.sessionId);

    if (!isSessionActive) {
      throw DomainErrorFactory.invalidRefreshToken();
    }

    const accessToken =
      this.tokenService.generateAccessToken({
        userId: stored.userId,
        sessionId: stored.sessionId,
      });

    const newRefresh =
      this.tokenService.generateRefreshToken();

    await this.refreshRepo.revoke(
      jti,
      newRefresh.jti,
    );

    await this.refreshRepo.create({
      userId: stored.userId,
      sessionId: stored.sessionId,
      jti: newRefresh.jti,
      familyId: stored.familyId,
      tokenHash: await this.passwordHasher.hash(newRefresh.token),
      expiresAt: newRefresh.expiresAt,
    });

    return {
      token: accessToken,
      refreshToken: newRefresh.token,
    };
  }
}
