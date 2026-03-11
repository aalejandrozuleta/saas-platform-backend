import { LoginContext } from '@domain/value-objects/login-context.vo';
import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { LoginPolicy } from '@domain/policies/login.policy';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { LoginAttemptedEvent } from '@application/events/login/login-attempted.event';
import { LoginSucceededEvent } from '@application/events/login/login-succeeded.event';
import { LoginFailedEvent } from '@application/events/login/login-failed.event';
import { LoginBlockedEvent } from '@application/events/login/login-blocked.event';
import { UserRepository } from '@domain/repositories/user.repository';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { DeviceRepository } from '@domain/repositories/device.repository';
import { SessionRepository } from '@application/ports/session.repository';
import { RefreshTokenRepository } from '@application/ports/refresh-token.repository';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { TokenService } from '@application/ports/token.service.token';
import { UnitOfWork } from '@application/ports/unit-of-work.port';
import { DomainEventBus } from '@application/events/domain-event.bus';
import { Clock } from '@application/ports/clock.port';

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
      status: 'ACTIVE' as any,
      emailVerified: true,
      failedLoginAttempts: 0,
      blockedUntil: undefined,
      createdAt: new Date(),
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

    securityRepository.findByUserId.mockResolvedValue(null);

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
    ).rejects.toThrow(DomainErrorFactory.invalidCredentials());

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
    ).rejects.toThrow(DomainErrorFactory.invalidCredentials());

    expect(securityRepository.registerFailedAttempt)
      .toHaveBeenCalled();
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

  it('debe crear dispositivo si no existe', async () => {

    setupSuccessfulLogin();

    deviceRepository.getByUserIdAndFingerprint.mockResolvedValue(null);

    deviceRepository.save.mockResolvedValue({
      id: 'device-new',
      isTrusted: true,
      updateLastUsed: () => ({
        id: 'device-new',
        isTrusted: true,
      }),
    } as any);

    await useCase.execute(
      'test@test.com',
      'Password123!',
      context,
    );

    expect(deviceRepository.save).toHaveBeenCalled();
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

});