import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { type UserRepository } from '@domain/repositories/user.repository';
import { type DomainEventBus } from '@application/events/domain-event.bus';
import { type EnvService } from '@config/env/env.service';
import { PasswordResetRequestedEvent } from '@application/events/password/password-reset-requested.event';

import { ForgotPasswordUseCase } from './forgot-password.use-case';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let eventBus: jest.Mocked<DomainEventBus>;
  let envService: jest.Mocked<EnvService>;

  const makeUser = () =>
    User.fromPersistence({
      id: 'user-1',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'hash',
      role: 'CUSTOMER' as any,
      status: 'ACTIVE' as any,
      emailVerified: true,
      failedLoginAttempts: 0,
      lockoutCount: 0,
      mustChangePassword: false,
      createdAt: new Date(),
    });

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      update: jest.fn(),
    } as any;

    eventBus = {
      publish: jest.fn(),
    } as any;

    envService = {
      get: jest.fn().mockReturnValue(1800),
    } as any;

    useCase = new ForgotPasswordUseCase(userRepository, eventBus, envService);
  });

  it('debe generar un token de recuperación y publicar el evento si el usuario existe', async () => {
    const user = makeUser();
    userRepository.findByEmail.mockResolvedValue(user);

    await useCase.execute('test@example.com');

    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ passwordResetToken: expect.any(String) }),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(PasswordResetRequestedEvent));
  });

  it('no debe hacer nada si el usuario no existe (evita enumeración de cuentas)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await useCase.execute('unknown@example.com');

    expect(userRepository.update).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
