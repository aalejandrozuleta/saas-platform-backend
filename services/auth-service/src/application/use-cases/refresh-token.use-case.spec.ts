import { ErrorCode } from '@saas/shared';
import { type RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { type TokenService } from '@application/ports/token.service.token';
import { type PasswordHasher } from '@application/ports/password-hasher.port';
import { type SessionCache } from '@application/ports/session-cache.port';

import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let tokenService: jest.Mocked<TokenService>;
  let refreshRepo: jest.Mocked<RefreshTokenRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let sessionCache: jest.Mocked<SessionCache>;

  beforeEach(() => {
    tokenService = {
      verifyRefreshToken: jest.fn(),
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    } as any;

    refreshRepo = {
      findByJti: jest.fn(),
      revoke: jest.fn(),
      create: jest.fn(),
      revokeBySession: jest.fn(),
    } as any;

    passwordHasher = {
      verify: jest.fn(),
      hash: jest.fn(),
    } as any;

    sessionCache = {
      storeSession: jest.fn(),
      isSessionActive: jest.fn(),
      revokeSession: jest.fn(),
    } as any;

    useCase = new RefreshTokenUseCase(
      tokenService,
      refreshRepo,
      passwordHasher,
      sessionCache,
    );
  });

  it('debe rotar refresh token cuando la sesión sigue activa', async () => {
    tokenService.verifyRefreshToken.mockReturnValue({ jti: 'old-jti' });
    refreshRepo.findByJti.mockResolvedValue({
      id: 'db-id',
      userId: 'user-1',
      sessionId: 'session-1',
      familyId: 'family-1',
      tokenHash: 'stored-hash',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    passwordHasher.verify.mockResolvedValue(true);
    sessionCache.isSessionActive.mockResolvedValue(true);
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockReturnValue({
      token: 'new-refresh-token',
      jti: 'new-jti',
      expiresAt: new Date(Date.now() + 120_000),
    });
    passwordHasher.hash.mockResolvedValue('new-hash');

    const result = await useCase.execute('raw-refresh-token');

    expect(result).toEqual({
      token: 'access-token',
      refreshToken: 'new-refresh-token',
    });
    expect(refreshRepo.revoke).toHaveBeenCalledWith(
      'old-jti',
      'new-jti',
    );
    expect(refreshRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        familyId: 'family-1',
        tokenHash: 'new-hash',
      }),
    );
  });

  it('debe rechazar refresh token faltante o inválido', async () => {
    await expect(
      useCase.execute('' as any),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_REFRESH_TOKEN,
    });

    tokenService.verifyRefreshToken.mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(
      useCase.execute('bad-token'),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_REFRESH_TOKEN,
    });
  });

  it('debe rechazar refresh token si la sesión ya no está activa', async () => {
    tokenService.verifyRefreshToken.mockReturnValue({ jti: 'old-jti' });
    refreshRepo.findByJti.mockResolvedValue({
      id: 'db-id',
      userId: 'user-1',
      sessionId: 'session-1',
      familyId: 'family-1',
      tokenHash: 'stored-hash',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    });
    passwordHasher.verify.mockResolvedValue(true);
    sessionCache.isSessionActive.mockResolvedValue(false);

    await expect(
      useCase.execute('raw-refresh-token'),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_REFRESH_TOKEN,
    });
  });
});
