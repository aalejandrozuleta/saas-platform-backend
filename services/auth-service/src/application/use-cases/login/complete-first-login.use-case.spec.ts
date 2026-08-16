import { ErrorCode } from '@saas/shared';
import { User } from '@domain/entities/user/user.entity';
import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';
import { Device } from '@domain/entities/device/device.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { UserStatus } from '@domain/enums/user-status.enum';
import { UserRole } from '@domain/enums/user-role.enum';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';

import { CompleteFirstLoginUseCase } from './complete-first-login.use-case';

describe('CompleteFirstLoginUseCase', () => {
  let useCase: CompleteFirstLoginUseCase;

  let userRepository: any;
  let userProfileRepository: any;
  let deviceRepository: any;
  let sessionRepository: any;
  let refreshTokenRepository: any;
  let passwordHasher: any;
  let tokenService: any;
  let uow: any;
  let eventBus: any;
  let sessionCache: any;
  let clock: any;
  let envService: any;
  let userPermissionService: any;

  const NOW = new Date('2026-01-01T00:00:00.000Z');
  const context = { ip: '127.0.0.1' };

  const createProvisionedUser = (overrides?: Partial<{ mustChangePassword: boolean }>) =>
    User.fromPersistence({
      id: 'user-1',
      email: EmailVO.create('maria.perez@acme.trabajadores.local'),
      passwordHash: 'temp-hash',
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      failedLoginAttempts: 0,
      lockoutCount: 0,
      mustChangePassword: true,
      createdAt: new Date(),
      ...overrides,
    });

  const createProvisionedProfile = () =>
    UserProfile.createProvisioned({
      userId: 'user-1',
      firstName: 'María',
      lastName: 'Pérez',
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
      update: jest.fn().mockResolvedValue(undefined),
      updateLastLogin: jest.fn().mockResolvedValue(undefined),
    };

    userProfileRepository = {
      findByUserId: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
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

    passwordHasher = {
      hash: jest.fn().mockResolvedValue('new-hash'),
      verify: jest.fn(),
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

    useCase = new CompleteFirstLoginUseCase(
      userRepository,
      userProfileRepository,
      deviceRepository,
      sessionRepository,
      refreshTokenRepository,
      passwordHasher,
      tokenService,
      uow,
      eventBus,
      sessionCache,
      clock,
      envService,
      userPermissionService,
    );
  });

  const mockValidChangeToken = (
    overrides?: Partial<{ deviceFingerprint?: string; country?: string }>,
  ) => {
    tokenService.verifyChallengeToken.mockReturnValue({
      userId: 'user-1',
      deviceFingerprint: 'device-abc',
      country: 'CO',
      reason: 'PASSWORD_CHANGE_REQUIRED',
      ...overrides,
    });
    userRepository.findById.mockResolvedValue(createProvisionedUser());
    userProfileRepository.findByUserId.mockResolvedValue(createProvisionedProfile());
  };

  describe('flujo exitoso', () => {
    beforeEach(() => {
      mockValidChangeToken();
      deviceRepository.getByUserIdAndFingerprint.mockResolvedValue(existingTrustedDevice);
    });

    it('debe cambiar la contraseña, limpiar mustChangePassword y devolver tokens', async () => {
      const result = await useCase.execute('change-token', 'NewSecurePass456@', context);

      expect(passwordHasher.hash).toHaveBeenCalledWith('NewSecurePass456@');
      expect(userRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ passwordHash: 'new-hash', mustChangePassword: false }),
      );
      expect(result).toEqual({
        token: 'access-token',
        refreshToken: 'refresh-token',
        role: UserRole.EMPLOYEE,
        permissions: [],
      });
    });

    it('debe aceptar el consentimiento del perfil provisionado', async () => {
      await useCase.execute('change-token', 'NewSecurePass456@', context);

      expect(userProfileRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          dataProcessingAcceptedAt: expect.any(Date),
          termsAcceptedAt: expect.any(Date),
        }),
      );
    });

    it('debe publicar LoginSucceededEvent con el sessionId', async () => {
      await useCase.execute('change-token', 'NewSecurePass456@', context);

      expect(eventBus.publish).toHaveBeenCalledWith(expect.any(LoginSucceededEvent));
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', sessionId: 'session-1' }),
      );
    });
  });

  describe('dispositivo nuevo', () => {
    it('debe crear el dispositivo como confiable si no existía', async () => {
      mockValidChangeToken();
      deviceRepository.getByUserIdAndFingerprint.mockResolvedValue(null);

      await useCase.execute('change-token', 'NewSecurePass456@', context);

      expect(deviceRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ fingerprint: 'device-abc', isTrusted: true }),
        expect.anything(),
      );
    });
  });

  describe('validación del token de cambio', () => {
    it('debe lanzar INVALID_CHALLENGE_TOKEN si el token no es válido', async () => {
      tokenService.verifyChallengeToken.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(
        useCase.execute('bad-token', 'NewSecurePass456@', context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CHALLENGE_TOKEN });
    });

    it('debe lanzar INVALID_CHALLENGE_TOKEN si el reason no es PASSWORD_CHANGE_REQUIRED (ej. token de 2FA)', async () => {
      tokenService.verifyChallengeToken.mockReturnValue({
        userId: 'user-1',
        deviceFingerprint: 'device-abc',
        reason: 'TWO_FACTOR_REQUIRED',
      });

      await expect(
        useCase.execute('mfa-token', 'NewSecurePass456@', context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CHALLENGE_TOKEN });

      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('debe lanzar INVALID_CHALLENGE_TOKEN si el usuario no existe', async () => {
      tokenService.verifyChallengeToken.mockReturnValue({
        userId: 'user-1',
        deviceFingerprint: 'device-abc',
        reason: 'PASSWORD_CHANGE_REQUIRED',
      });
      userRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('change-token', 'NewSecurePass456@', context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CHALLENGE_TOKEN });
    });

    it('debe lanzar INVALID_CHALLENGE_TOKEN si el usuario ya no tiene mustChangePassword activo', async () => {
      tokenService.verifyChallengeToken.mockReturnValue({
        userId: 'user-1',
        deviceFingerprint: 'device-abc',
        reason: 'PASSWORD_CHANGE_REQUIRED',
      });
      userRepository.findById.mockResolvedValue(
        createProvisionedUser({ mustChangePassword: false }),
      );

      await expect(
        useCase.execute('change-token', 'NewSecurePass456@', context),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CHALLENGE_TOKEN });

      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('límite de sesiones activas', () => {
    it('debe revocar la sesión más antigua si hay 3 o más activas', async () => {
      mockValidChangeToken();
      deviceRepository.getByUserIdAndFingerprint.mockResolvedValue(existingTrustedDevice);
      sessionRepository.countActiveSessions.mockResolvedValue(3);

      await useCase.execute('change-token', 'NewSecurePass456@', context);

      expect(sessionRepository.revokeOldestActiveSession).toHaveBeenCalledWith(
        'user-1',
        NOW,
        expect.anything(),
      );
    });
  });
});
