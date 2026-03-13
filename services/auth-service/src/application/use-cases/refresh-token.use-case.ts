import { Inject } from '@nestjs/common';
import { TokenService } from '@application/ports/token.service.token';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import {
  TOKEN_SERVICE,
  PASSWORD_HASHER,
} from '@domain/token/services.tokens';
import { REFRESH_TOKEN_REPOSITORY } from '@domain/token/repositories.tokens';

export class RefreshTokenUseCase {

  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,

    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshRepo: RefreshTokenRepository,

    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) { }

  async execute(refreshToken: string) {

    const { jti } =
      this.tokenService.verifyRefreshToken(refreshToken);

    const stored =
      await this.refreshRepo.findByJti(jti);

    if (!stored) {
      throw new Error('Invalid refresh token');
    }

    if (stored.revokedAt) {
      throw new Error('Refresh token revoked');
    }

    if (stored.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }

    const valid = await this.passwordHasher.verify(
      stored.tokenHash,
      refreshToken,
    );

    if (!valid) {
      throw new Error('Invalid refresh token');
    }

    const accessToken =
      this.tokenService.generateAccessToken({
        userId: stored.userId,
        sessionId: stored.sessionId,
      });

    const newRefresh =
      this.tokenService.generateRefreshToken();

    await this.refreshRepo.revoke(
      stored.id,
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