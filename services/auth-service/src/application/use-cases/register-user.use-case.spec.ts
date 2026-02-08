import { UserRepository } from '@domain/repositories/user.repository';
import { EmailAlreadyExistsError } from '@domain/errors/email-already-exists.error';
import { PasswordHasherService } from '@infrastructure/crypto/password-hasher.service';
import { EmailVO } from '@domain/value-objects/email.vo';
import { User } from '@domain/entities/user.entity';

import { RegisterUserUseCase } from './register-user.use-case';

/**
 * Mocks manuales (no jest.mock global)
 * Mantiene el test explícito y controlado
 */
describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordHasher: jest.Mocked<PasswordHasherService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    passwordHasher = {
      hash: jest.fn(),
    } as any;

    useCase = new RegisterUserUseCase(
      userRepository,
      passwordHasher,
    );
  });

  it('debe registrar un usuario correctamente (happy path)', async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-password');

    const email = 'test@example.com';
    const password = 'Str0ng-P@ssword';

    // Act
    const result = await useCase.execute(email, password);

    // Assert
    expect(result).toBeInstanceOf(User);
    expect(result.email.getValue()).toBe(email);

    expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      EmailVO.create(email),
    );

    expect(passwordHasher.hash).toHaveBeenCalledTimes(1);
    expect(passwordHasher.hash).toHaveBeenCalledWith(password);

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save).toHaveBeenCalledWith(result);
  });

  it('debe lanzar error si el email ya existe', async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValue({} as User);

    const email = 'existing@example.com';
    const password = 'Str0ng-P@ssword';

    // Act + Assert
    await expect(
      useCase.execute(email, password),
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);

    expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });
});
