import { ErrorCode } from '@saas/shared';
import { User } from '@domain/entities/user/user.entity';
import { Device } from '@domain/entities/device/device.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { UserStatus } from '@domain/enums/user-status.enum';
import { UserRole } from '@domain/enums/user-role.enum';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';

import { VerifyLoginChallengeUseCase } from './verify-login-challenge.use-case';

describe('VerifyLoginChallengeUseCase', () => {
  let useCase: VerifyLoginChallengeUseCase;

  let userRepository: any;
  let securityRepository: any;
  let deviceRepository: any;
  let sessionRepository: any;
  let refreshTokenRepository: any;
  let recoveryCodeRepository: any;
  let passwordHasher: any;
  let tokenService: any;
  let totpService: any;
  let uow: any;
  let eventBus: any;
  let sessionCache: any;
  let clock: any;
  let envService: any;
  let userPermissionService: any;

  const NOW = new Date('2026-01-01T00:00:00.000Z');
  const context = { ip: '127.0.0.1' };

  const createUser = (overrides?: Partial<{ status: UserStatus }>) =>
    User.fromPersistence({
      id: 'user-1',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'hash',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      failedLoginAttempts: 0,
      lockoutCount: 0,
      createdAt: new Date(),
      ...overrides,
    });

  const existingTrustedDevice = Device.fromPersistence({
    id: 'device-1',
    userId: 'user-1',
    fingerprint: 'device-abc',
    ipAddress: '127.0.0.1',
    isTrusted: true,
    createdAt: new Date(),
  });

  beforeEach(() => {
    jest.resetAllMocks();

    userRepository = {
      findById: jest.fn(),
      updateLastLogin: jest.fn().mockResolvedValue(undefined),
    };

    securityRepository = {
      getTotpSecret: jest.fn(),
      findByUserId: jest.fn(),
      addTrustedCountry: jest.fn(),
    };

    deviceRepository = {
      getByUserIdAndFingerprint: jest.fn(),
      save: jest.fn(),
    };

    sessionRepository = {
      countActiveSessions: jest.fn().mockResolvedValue(0),
      revokeOldestActiveSession: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'session-1' }),
    };

    refreshTokenRepository = {
      create: jest.fn().mockResolvedValue(undefined),
    };

    recoveryCodeRepository = {
      findUnusedByUser: jest.fn(),
      markUsed: jest.fn(),
    };

    passwordHasher = {
      verify: jest.fn(),
      hash: jest.fn().mockResolvedValue('hashed-refresh'),
    };

    tokenService = {
      verifyChallengeToken: jest.fn(),
      generateAccessToken: jest.fn().mockReturnValue('access-token'),
      generateRefreshToken: jest.fn().mockReturnValue({
        token: 'refresh-token',
        jti: 'jti-1',
        expiresAt: new Date(),
      }),
    };

    totpService = {
      verifyToken: jest.fn(),
    };

    uow = {
      execute: jest.fn().mockImplementation(async (fn: any) => fn({})),
    };

    eventBus = {
      publish: jest.fn(),
    };

    sessionCache = {
      storeSession: jest.fn().mockResolvedValue(undefined),
    };

    clock = {
      now: jest.fn().mockReturnValue(NOW),
    };

    envService = {
      get: jest.fn().mockReturnValue(900),
    };

    userPermissionService = {
      getEffectivePermissions: jest.fn().mockResolvedValue([]),
    };

    useCase = new VerifyLoginChallengeUseCase(
      userRepository,
      securityRepository,
      deviceRepository,
      sessionRepository,
      refreshTokenRepository,
      recoveryCodeRepository,
      passwordHasher,
      tokenService,
      totpService,
      uow,
      eventBus,
      sessionCache,
      clock,
      envService,
      userPermissionService,
    );
  });

  const mockValidChallenge = (
    overrides?: Partial<{ country?: string; deviceFingerprint?: string }>,
  ) => {
    tokenService.verifyChallengeToken.mockReturnValue({
      userId: 'user-1',
      deviceFingerprint: 'device-abc',
      country: 'CO',
      reason: 'TWO_FACTOR_REQUIRED',
      ...overrides,
    });
    userRepository.findById.mockResolvedValue(createUser());
  };

  describe('flujo exitoso con TOTP', () => {
    beforeEach(() => {
      mockValidChallenge();
      deviceRepository.getByUserIdAndFingerprint.mockResolvedValue(existingTrustedDevice);
      securityRepository.findByUserId.mockResolvedValue({ trustedCountries: ['CO'] });
      securityRepository.getTotpSecret.mockResolvedValue('SECRET');
      totpService.verifyToken.mockReturnValue(true);
    });

    it('debe completar el login y devolver tokens', async () => {
      const result = await useCase.execute('challenge-token', { totpCode: '123456' }, context);

      expect(result).toEqual({
        token: 'access-token',
        refreshToken: 'refresh-token',
        role: UserRole.CUSTOMER,
        permissions: [],
      });
    });

    it('debe publicar LoginSucceededEvent con el sessionId', async () => {
      await useCase.execute('challenge-token', { totpCode: '123456' }, context);

      expect(eventBus.publish).toHaveBeenCalledWith(expect.any(LoginSucceededEvent));
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', sessionId: 'session-1' }),
      );
    });

    it('no debe agregar el país si ya está en la lista de confianza', async () => {
      await useCase.execute('challenge-token', { totpCode: '123456' }, context);

      expect(securityRepository.addTrustedCountry).not.toHaveBeenCalled();
    });
  });

  describe('flujo exitoso con recovery code', () => {
    beforeEach(() => {
      mockValidChallenge();
      deviceRepository.getByUserIdAndFingerprint.mockResolvedValue(existingTrustedDevice);
      securityRepository.findByUserId.mockResolvedValue({ trustedCountries: [] });
      recoveryCodeRepository.findUnusedByUser.mockResolvedValue([
        { id: 'code-1', codeHash: 'hash-1' },
        { id: 'code-2', codeHash: 'hash-2' },
      ]);
    });

    it('debe consumir el código que coincide y completar el login', async () => {
      passwordHasher.verify.mockImplementation(
        async (hash: string, plain: string) => hash === 'hash-2' && plain === 'MY-RECOVERY-CODE',
      );

      const result = await useCase.execute(
        'challenge-token',
        { recoveryCode: 'MY-RECOVERY-CODE' },
        context,
      );

      expect(recoveryCodeRepository.markUsed).toHaveBeenCalledWith('code-2');
      expect(result).toEqual({
        token: 'access-token',
        refreshToken: 'refresh-token',
        role: UserRole.CUSTOMER,
        permissions: [],
      });
    });

    it('debe agregar el país si no está en la lista de confianza', async () => {
      passwordHasher.verify.mockResolvedValue(true);

      await useCase.execute('challenge-token', { recoveryCode: 'MY-RECOVERY-CODE' }, context);

      expect(securityRepository.addTrustedCountry).toHaveBeenCalledWith('user-1', 'CO');
    });

    it('debe lanzar INVALID_RECOVERY_CODE si ningún código coincide', async () => {
      passwordHasher.verify.mockResolvedValue(false);

      await expect(
        useCase.execute('challenge-token', { recoveryCode: 'WRONG-CODE' }, context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_RECOVERY_CODE });

      expect(recoveryCodeRepository.markUsed).not.toHaveBeenCalled();
    });
  });

  describe('dispositivo nuevo (NEW_DEVICE)', () => {
    it('debe crear el dispositivo como confiable si no existía', async () => {
      mockValidChallenge();
      deviceRepository.getByUserIdAndFingerprint.mockResolvedValue(null);
      securityRepository.findByUserId.mockResolvedValue({ trustedCountries: ['CO'] });
      securityRepository.getTotpSecret.mockResolvedValue('SECRET');
      totpService.verifyToken.mockReturnValue(true);

      await useCase.execute('challenge-token', { totpCode: '123456' }, context);

      expect(deviceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ fingerprint: 'device-abc', isTrusted: true }),
        expect.anything(),
      );
    });
  });

  describe('validación del challenge token', () => {
    it('debe lanzar INVALID_CHALLENGE_TOKEN si el token no es válido', async () => {
      tokenService.verifyChallengeToken.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(
        useCase.execute('bad-token', { totpCode: '123456' }, context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CHALLENGE_TOKEN });
    });

    it('debe lanzar INVALID_CHALLENGE_TOKEN si el usuario no existe', async () => {
      tokenService.verifyChallengeToken.mockReturnValue({
        userId: 'user-1',
        deviceFingerprint: 'device-abc',
        reason: 'TWO_FACTOR_REQUIRED',
      });
      userRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('challenge-token', { totpCode: '123456' }, context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CHALLENGE_TOKEN });
    });

    it('debe lanzar INVALID_CHALLENGE_TOKEN si el usuario no está ACTIVO', async () => {
      tokenService.verifyChallengeToken.mockReturnValue({
        userId: 'user-1',
        deviceFingerprint: 'device-abc',
        reason: 'TWO_FACTOR_REQUIRED',
      });
      userRepository.findById.mockResolvedValue(createUser({ status: UserStatus.BLOCKED }));

      await expect(
        useCase.execute('challenge-token', { totpCode: '123456' }, context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CHALLENGE_TOKEN });
    });
  });

  describe('validación del factor', () => {
    beforeEach(() => {
      mockValidChallenge();
      deviceRepository.getByUserIdAndFingerprint.mockResolvedValue(existingTrustedDevice);
      securityRepository.findByUserId.mockResolvedValue({ trustedCountries: ['CO'] });
    });

    it('debe lanzar INVALID_TOTP_CODE si el código es inválido', async () => {
      securityRepository.getTotpSecret.mockResolvedValue('SECRET');
      totpService.verifyToken.mockReturnValue(false);

      await expect(
        useCase.execute('challenge-token', { totpCode: '000000' }, context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_TOTP_CODE });
    });

    it('debe lanzar INVALID_TOTP_CODE si no hay secreto TOTP activo', async () => {
      securityRepository.getTotpSecret.mockResolvedValue(null);

      await expect(
        useCase.execute('challenge-token', { totpCode: '123456' }, context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_TOTP_CODE });
    });

    it('debe lanzar TWO_FACTOR_CREDENTIAL_REQUIRED si no se envía ni totpCode ni recoveryCode', async () => {
      await expect(useCase.execute('challenge-token', {}, context)).rejects.toMatchObject({
        code: ErrorCode.TWO_FACTOR_CREDENTIAL_REQUIRED,
      });

      expect(sessionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('límite de sesiones activas', () => {
    it('debe revocar la sesión más antigua si hay 3 o más activas', async () => {
      mockValidChallenge();
      deviceRepository.getByUserIdAndFingerprint.mockResolvedValue(existingTrustedDevice);
      securityRepository.findByUserId.mockResolvedValue({ trustedCountries: ['CO'] });
      securityRepository.getTotpSecret.mockResolvedValue('SECRET');
      totpService.verifyToken.mockReturnValue(true);
      sessionRepository.countActiveSessions.mockResolvedValue(3);

      await useCase.execute('challenge-token', { totpCode: '123456' }, context);

      expect(sessionRepository.revokeOldestActiveSession).toHaveBeenCalledWith(
        'user-1',
        NOW,
        expect.anything(),
      );
    });
  });
});
