import { UserRepository } from '@domain/repositories/user.repository';
import { EmailAlreadyExistsError } from '@domain/errors/email-already-exists.error';
import { EmailVO } from '@domain/value-objects/email.vo';
import { User } from '@domain/entities/user.entity';
import { PlatformLogger } from '@saas/shared';
import { PasswordHasher } from '@application/ports/password-hasher.port';
import { AuditLogger } from '@application/ports/audit-logger.port';

import { RegisterUserUseCase } from './register-user.use-case';
/**
 * Tests unitarios del caso de uso RegisterUserUseCase
 *
 * - Arquitectura hexagonal real
 * - Dependencias por puertos
 * - Sin Nest TestingModule
 * - Sin casts inseguros
 */
describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
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
    };

    passwordHasher = {
      hash: jest.fn(),
      verify: jest.fn(),
    };

    auditLogger = {
      log: jest.fn(),
    };

    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as jest.Mocked<PlatformLogger>;

    useCase = new RegisterUserUseCase(
      userRepository,
      passwordHasher,
      auditLogger,
      logger,
    );
  });

  it('debe registrar un usuario correctamente (happy path)', async () => {
    // Arrange
    const email = 'test@example.com';
    const password = 'Str0ng-P@ssword';

    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-password');

    // Act
    const result = await useCase.execute(email, password, context);

    // Assert
    expect(result).toBeInstanceOf(User);
    expect(result.email.getValue()).toBe(email);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      EmailVO.create(email),
    );

    expect(passwordHasher.hash).toHaveBeenCalledWith(password);

    expect(userRepository.save).toHaveBeenCalledWith(result);

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'REGISTER_SUCCESS',
        ip: context.ip,
        country: context.country,
        deviceFingerprint: context.deviceFingerprint,
      }),
    );

    expect(logger.info).toHaveBeenCalled();
  });

  it('debe lanzar error si el email ya existe', async () => {
    // Arrange
    const email = 'existing@example.com';
    const password = 'Str0ng-P@ssword';

    userRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
    } as User);

    // Act + Assert
    await expect(
      useCase.execute(email, password, context),
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);

    expect(userRepository.save).not.toHaveBeenCalled();
    expect(passwordHasher.hash).not.toHaveBeenCalled();

    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'REGISTER_FAILED',
        reason: 'EMAIL_ALREADY_EXISTS',
        ip: context.ip,
      }),
    );

    expect(logger.warn).toHaveBeenCalled();
  });
});
