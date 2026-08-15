import { type UserRepository } from '@domain/repositories/user.repository';
import { type UserProfileRepository } from '@domain/repositories/user-profile.repository';
import { type PasswordHasher } from '@application/ports/password-hasher.port';
import { type UnitOfWork } from '@application/ports/unit-of-work.port';
import { type DomainEventBus } from '@application/events/domain-event.bus';
import { WorkerProvisionedEvent } from '@application/events/user/worker-provisioned.event';

import { ProvisionWorkerUseCase } from './provision-worker.use-case';

describe('ProvisionWorkerUseCase', () => {
  let useCase: ProvisionWorkerUseCase;

  let userRepository: jest.Mocked<UserRepository>;
  let userProfileRepository: jest.Mocked<UserProfileRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let uow: jest.Mocked<UnitOfWork>;
  let eventBus: jest.Mocked<DomainEventBus>;

  const input = {
    firstName: 'María',
    lastName: 'Pérez',
    contactEmail: 'contacto@acme.com',
    companyName: 'Acme Corp',
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
    } as any;

    userProfileRepository = {
      save: jest.fn().mockResolvedValue(undefined),
    } as any;

    passwordHasher = {
      hash: jest.fn().mockResolvedValue('hashed-temp-password'),
      verify: jest.fn(),
    } as any;

    uow = {
      execute: jest.fn(),
    } as any;

    eventBus = {
      publish: jest.fn(),
    } as any;

    useCase = new ProvisionWorkerUseCase(
      userRepository,
      userProfileRepository,
      passwordHasher,
      uow,
      eventBus,
    );
  });

  it('debe crear User + UserProfile y devolver userId/loginEmail sin exponer la contraseña temporal', async () => {
    const result = await useCase.execute(input);

    expect(result.loginEmail).toBe('maria.perez@acme-corp.trabajadores.local');
    expect(result.userId).toEqual(expect.any(String));
    expect(result).not.toHaveProperty('tempPassword');

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userProfileRepository.save).toHaveBeenCalledTimes(1);
  });

  it('debe marcar al usuario creado con mustChangePassword=true, rol EMPLOYEE y status ACTIVE', async () => {
    await useCase.execute(input);

    const savedUser = userRepository.save.mock.calls[0][0];

    expect(savedUser.mustChangePassword).toBe(true);
    expect(savedUser.role).toBe('EMPLOYEE');
    expect(savedUser.status).toBe('ACTIVE');
  });

  it('debe publicar WorkerProvisionedEvent con la contraseña temporal, no en el valor de retorno', async () => {
    const result = await useCase.execute(input);

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    const publishedEvent = eventBus.publish.mock.calls[0][0] as WorkerProvisionedEvent;

    expect(publishedEvent).toBeInstanceOf(WorkerProvisionedEvent);
    expect(publishedEvent.userId).toBe(result.userId);
    expect(publishedEvent.loginEmail).toBe(result.loginEmail);
    expect(publishedEvent.contactEmail).toBe(input.contactEmail);
    expect(publishedEvent.firstName).toBe(input.firstName);
    expect(publishedEvent.companyName).toBe(input.companyName);
    expect(typeof publishedEvent.tempPassword).toBe('string');
    expect(publishedEvent.tempPassword.length).toBeGreaterThanOrEqual(12);
  });

  it('debe reintentar con sufijo numérico si el email generado ya existe (colisión) y luego tener éxito', async () => {
    userRepository.findByEmail
      .mockResolvedValueOnce({} as any) // primer intento: colisión
      .mockResolvedValueOnce(null); // segundo intento: disponible

    const result = await useCase.execute(input);

    expect(result.loginEmail).toBe('maria.perez.2@acme-corp.trabajadores.local');
    expect(userRepository.findByEmail).toHaveBeenCalledTimes(2);
  });

  it('debe hashear la contraseña temporal antes de persistir el usuario', async () => {
    await useCase.execute(input);

    expect(passwordHasher.hash).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0][0];
    expect(savedUser.passwordHash).toBe('hashed-temp-password');
  });
});
