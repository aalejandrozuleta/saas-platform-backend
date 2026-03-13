import { User } from '@domain/entities/user/user.entity';
import { AuthAuditEvent } from '@application/audit/auth-events.enum';
import { PlatformLogger } from '@saas/shared';
import { UserRepository } from '@domain/repositories/user.repository';
import { AuditLogger } from '@application/ports/audit-logger.port';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { DeviceRepository } from '@domain/repositories/device.repository';

import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let deviceRepository: jest.Mocked<DeviceRepository>;
  let auditLogger: jest.Mocked<AuditLogger>;
  let logger: jest.Mocked<PlatformLogger>;

  const context = {
    ip: '127.0.0.1',
    country: 'CO',
    deviceFingerprint: 'device-123',
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as any;

    passwordHasher = {
      hash: jest.fn(),
      verify: jest.fn(),
    } as any;

    deviceRepository = {
      save: jest.fn(),
      getByUserIdAndFingerprint: jest.fn(),
    } as any;

    auditLogger = {
      log: jest.fn(),
    } as any;

    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as jest.Mocked<PlatformLogger>;

    useCase = new RegisterUserUseCase(
      userRepository,
      passwordHasher,
      deviceRepository,
      auditLogger,
      logger,
    );
  });

  it('debe registrar un usuario correctamente y confiar el dispositivo actual', async () => {
    const email = 'test@example.com';
    const password = 'Str0ng-P@ssword';

    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-password');
    deviceRepository.save.mockResolvedValue({} as any);

    const result = await useCase.execute(email, password, context);

    expect(result).toBeInstanceOf(User);
    expect(result.email.getValue()).toBe(email);
    expect(result.passwordHash).toBe('hashed-password');

    const calledEmailVO =
      (userRepository.findByEmail as jest.Mock).mock.calls[0][0];

    expect(calledEmailVO.getValue()).toBe(email);
    expect(passwordHasher.hash).toHaveBeenCalledWith(password);
    expect(userRepository.save).toHaveBeenCalledWith(result);
    expect(deviceRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: result.id,
        fingerprint: context.deviceFingerprint,
        isTrusted: true,
      }),
    );
    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        event: AuthAuditEvent.REGISTER_SUCCESS,
        ip: context.ip,
      }),
    );
    expect(logger.info).toHaveBeenCalled();
  });

  it('no debe crear dispositivo si el registro no trae fingerprint', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-password');

    await useCase.execute('test@example.com', 'Str0ng-P@ssword', {
      ...context,
      deviceFingerprint: undefined,
    });

    expect(deviceRepository.save).not.toHaveBeenCalled();
  });

  it('debe lanzar error si el email ya existe', async () => {
    const email = 'existing@example.com';
    const password = 'Str0ng-P@ssword';

    const existingUser = {
      id: 'user-id',
    } as User;

    userRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(
      useCase.execute(email, password, context),
    ).rejects.toBeInstanceOf(Error);

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(deviceRepository.save).not.toHaveBeenCalled();
    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-id',
        event: AuthAuditEvent.REGISTER_FAILED,
        reason: 'EMAIL_ALREADY_EXISTS',
      }),
    );
    expect(logger.warn).toHaveBeenCalled();
  });
});
