import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { type UserRepository } from '@domain/repositories/user.repository';
import { type DomainEventBus } from '@application/events/domain-event.bus';
import { type EnvService } from '@config/env/env.service';
import { VerificationEmailRequestedEvent } from '@application/events/user/verification-email-requested.event';

import { ResendVerificationUseCase } from './resend-verification.use-case';

describe('ResendVerificationUseCase', () => {
  let useCase: ResendVerificationUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let eventBus: jest.Mocked<DomainEventBus>;
  let envService: jest.Mocked<EnvService>;

  const makeUser = (emailVerified: boolean) =>
    User.fromPersistence({
      id: 'user-1',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'hash',
      role: 'CUSTOMER' as any,
      status: emailVerified ? ('ACTIVE' as any) : ('PENDING' as any),
      emailVerified,
      failedLoginAttempts: 0,
      lockoutCount: 0,
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
      get: jest.fn().mockReturnValue(3600),
    } as any;

    useCase = new ResendVerificationUseCase(userRepository, eventBus, envService);
  });

  it('debe generar un nuevo token y publicar el evento si el usuario existe y no está verificado', async () => {
    const user = makeUser(false);
    userRepository.findByEmail.mockResolvedValue(user);

    await useCase.execute('test@example.com');

    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ emailVerificationToken: expect.any(String) }),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(VerificationEmailRequestedEvent),
    );
  });

  it('no debe hacer nada si el usuario no existe (evita enumeración de cuentas)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await useCase.execute('unknown@example.com');

    expect(userRepository.update).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('debe lanzar error si el email ya está verificado', async () => {
    const user = makeUser(true);
    userRepository.findByEmail.mockResolvedValue(user);

    await expect(useCase.execute('test@example.com')).rejects.toMatchObject({
      code: 'EMAIL_ALREADY_VERIFIED',
    });

    expect(userRepository.update).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
