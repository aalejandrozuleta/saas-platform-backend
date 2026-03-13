import { ErrorCode } from '@saas/shared';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { type LoginPolicy } from '@domain/policies/login.policy';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { LoginAttemptedEvent } from '@application/events/login/login-attempted.event';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';
import { LoginFailedEvent } from '@application/events/login/login-failed.event';
import { LoginBlockedEvent } from '@application/events/login/login-blocked.event';
import { type UserRepository } from '@domain/repositories/user.repository';
import {
  type LoginSecurityProfile,
  type SecurityRepository,
} from '@domain/repositories/security.repository';
import { type DeviceRepository } from '@domain/repositories/device.repository';
import { type SessionRepository } from '@application/ports/session.repository';
import { type RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { type PasswordHasher } from '@application/ports/password-hasher.port';
import { type TokenService } from '@application/ports/token.service.token';
import { type UnitOfWork } from '@application/ports/unit-of-work.port';
import { type DomainEventBus } from '@application/events/domain-event.bus';
import { type Clock } from '@application/ports/clock.port';
import { type SessionCache } from '@application/ports/session-cache.port';
import { type EnvService } from '@config/env/env.service';
import { UserStatus } from '@domain/enums/user-status.enum';
import { LoginSecurityChallengeService } from '@application/security/login-security-challenge.service';
import { LoginChallengeReason } from '@application/security/login-challenge.types';

import { LoginUserUseCase } from './login-user.use-case';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;

  let userRepository: jest.Mocked<UserRepository>;
  let securityRepository: jest.Mocked<SecurityRepository>;
  let deviceRepository: jest.Mocked<DeviceRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let tokenService: jest.Mocked<TokenService>;
  let uow: jest.Mocked<UnitOfWork>;
  let eventBus: jest.Mocked<DomainEventBus>;
  let policy: jest.Mocked<LoginPolicy>;
  let clock: jest.Mocked<Clock>;
  let sessionCache: jest.Mocked<SessionCache>;
  let envService: jest.Mocked<EnvService>;
  let loginSecurityChallengeService: LoginSecurityChallengeService;

  const context = LoginContext.create({
    ip: '127.0.0.1',
    deviceFingerprint: 'device-123',
    country: 'CO',
  });

  const createUser = (overrides?: Partial<any>) =>
    User.fromPersistence({
      id: 'user-1',
      email: EmailVO.create('test@test.com'),
      passwordHash: 'hash',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      failedLoginAttempts: 0,
      blockedUntil: undefined,
      createdAt: new Date(),
      ...overrides,
    });

  const createSecurityProfile = (
    overrides?: Partial<LoginSecurityProfile>,
  ): LoginSecurityProfile => ({
    trustedCountries: [],
    twoFactorEnabled: false,
    twoFactorMethod: undefined,
    hasRecoveryCodes: false,
    ...overrides,
  });

  const setupSuccessfulLogin = () => {
    const user = createUser();

    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(true);
    deviceRepository.getByUserIdAndFingerprint.mockResolvedValue({
      id: 'device-1',
      isTrusted: true,
      updateLastUsed: () => ({
        id: 'device-1',
        isTrusted: true,
      }),
    } as any);
    securityRepository.findByUserId.mockResolvedValue(
      createSecurityProfile(),
    );
    sessionRepository.countActiveSessions.mockResolvedValue(0);
    sessionRepository.create.mockResolvedValue({
      id: 'session-1',
    });
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockReturnValue({
      token: 'refresh-token',
      jti: 'jti',
      expiresAt: new Date(),
    });
    passwordHasher.hash.mockResolvedValue('hash');
    sessionCache.storeSession.mockResolvedValue();
    refreshTokenRepository.create.mockResolvedValue(undefined as any);
    uow.execute.mockImplementation(async (fn: any) => fn({}));

    return user;
  };

  beforeEach(() => {
    jest.resetAllMocks();

    userRepository = {
      findByEmail: jest.fn(),
    } as any;

    securityRepository = {
      registerFailedAttempt: jest.fn(),
      resetFailedLoginAttempts: jest.fn(),
      releaseTemporaryBlock: jest.fn(),
      findByUserId: jest.fn(),
    } as any;

    deviceRepository = {
      getByUserIdAndFingerprint: jest.fn(),
      save: jest.fn(),
    } as any;

    sessionRepository = {
      countActiveSessions: jest.fn(),
      revokeOldestActiveSession: jest.fn(),
      create: jest.fn(),
    } as any;

    refreshTokenRepository = {
      create: jest.fn(),
    } as any;

    passwordHasher = {
      verify: jest.fn(),
      hash: jest.fn(),
    } as any;

    tokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    } as any;

    uow = {
      execute: jest.fn(),
    } as any;

    eventBus = {
      publish: jest.fn(),
    } as any;

    policy = {
      validateDeviceFingerprint: jest.fn(),
      validateUserStatus: jest.fn(),
      validateAttempts: jest.fn(),
      validateDevice: jest.fn(),
      validateCountry: jest.fn(),
      getMaxAttempts: jest.fn().mockReturnValue(5),
      lockDuration: jest.fn().mockReturnValue(10),
    } as any;

    clock = {
      now: jest.fn().mockReturnValue(new Date()),
    } as any;

    sessionCache = {
      storeSession: jest.fn(),
      isSessionActive: jest.fn(),
      revokeSession: jest.fn(),
    } as any;

    envService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'REDIS_SESSION_TTL') {
          return 900;
        }

        return undefined;
      }),
    } as any;

    loginSecurityChallengeService =
      new LoginSecurityChallengeService();

    useCase = new LoginUserUseCase(
      userRepository,
      securityRepository,
      deviceRepository,
      sessionRepository,
      refreshTokenRepository,
      passwordHasher,
      tokenService,
      uow,
      eventBus,
      policy,
      clock,
      sessionCache,
      envService,
      loginSecurityChallengeService,
    );
  });

  it('debe autenticar correctamente', async () => {
    setupSuccessfulLogin();

    const result = await useCase.execute(
      'test@test.com',
      'Password123!',
      context,
    );

    expect(result).toEqual({
      token: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(LoginAttemptedEvent),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(LoginSucceededEvent),
    );
  });

  it('debe lanzar error si usuario no existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute('test@test.com', 'Password123!', context),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_CREDENTIALS,
    });

    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(LoginFailedEvent),
    );
  });

  it('debe registrar intento fallido si contraseña es incorrecta', async () => {
    const user = createUser();

    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      useCase.execute('test@test.com', 'Password123!', context),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_CREDENTIALS,
    });

    expect(securityRepository.registerFailedAttempt)
      .toHaveBeenCalled();
    expect(securityRepository.resetFailedLoginAttempts)
      .not.toHaveBeenCalled();
  });

  it('debe emitir LoginBlockedEvent si usuario está bloqueado', async () => {
    const user = createUser({
      blockedUntil: new Date(),
    });

    userRepository.findByEmail.mockResolvedValue(user);
    policy.validateAttempts.mockImplementation(() => {
      throw DomainErrorFactory.userBlocked();
    });

    await expect(
      useCase.execute('test@test.com', 'Password123!', context),
    ).rejects.toThrow();

    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(LoginBlockedEvent),
    );
  });

  it('debe exigir challenge si el dispositivo es nuevo', async () => {
    const user = createUser();

    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(true);
    securityRepository.findByUserId.mockResolvedValue(
      createSecurityProfile({
        twoFactorEnabled: true,
        twoFactorMethod: 'TOTP',
      }),
    );
    deviceRepository.getByUserIdAndFingerprint.mockResolvedValue(null);

    await expect(
      useCase.execute('test@test.com', 'Password123!', context),
    ).rejects.toMatchObject({
      code: ErrorCode.SECURITY_CHALLENGE_REQUIRED,
      metadata: expect.objectContaining({
        reason: LoginChallengeReason.NEW_DEVICE,
      }),
    });
  });

  it('debe revocar sesión más antigua si hay demasiadas sesiones', async () => {
    setupSuccessfulLogin();
    sessionRepository.countActiveSessions.mockResolvedValue(3);

    await useCase.execute(
      'test@test.com',
      'Password123!',
      context,
    );

    expect(sessionRepository.revokeOldestActiveSession)
      .toHaveBeenCalled();
  });

  it('debe liberar un bloqueo temporal expirado antes de validar estado', async () => {
    const expiredDate = new Date(Date.now() - 60_000);
    const user = createUser({
      status: UserStatus.BLOCKED,
      failedLoginAttempts: 3,
      blockedUntil: expiredDate,
    });

    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      useCase.execute('test@test.com', 'Password123!', context),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_CREDENTIALS,
    });

    expect(securityRepository.releaseTemporaryBlock)
      .toHaveBeenCalledWith(user.id);
    expect(policy.validateUserStatus)
      .toHaveBeenCalledWith(UserStatus.ACTIVE);
  });

  it('debe resetear intentos cuando la contraseña es correcta aunque luego se exija challenge', async () => {
    const user = createUser({
      failedLoginAttempts: 2,
    });

    userRepository.findByEmail.mockResolvedValue(user);
    passwordHasher.verify.mockResolvedValue(true);
    deviceRepository.getByUserIdAndFingerprint.mockResolvedValue({
      id: 'device-1',
      isTrusted: false,
      updateLastUsed: () => ({
        id: 'device-1',
        isTrusted: false,
      }),
    } as any);
    securityRepository.findByUserId.mockResolvedValue(
      createSecurityProfile(),
    );

    await expect(
      useCase.execute('test@test.com', 'Password123!', context),
    ).rejects.toMatchObject({
      code: ErrorCode.SECURITY_CHALLENGE_REQUIRED,
      metadata: expect.objectContaining({
        reason: LoginChallengeReason.UNTRUSTED_DEVICE,
      }),
    });

    expect(securityRepository.resetFailedLoginAttempts)
      .toHaveBeenCalledWith(user.id);
  });
});
