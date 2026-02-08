import * as argon2 from 'argon2';

import { PasswordHasherService } from './password-hasher.service';

/**
 * Mock del módulo argon2
 */
jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
  argon2id: 2,
}));

describe('PasswordHasherService', () => {
  let service: PasswordHasherService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PasswordHasherService();
  });

  describe('hash', () => {
    it('debe generar un hash usando Argon2id con los parámetros correctos', async () => {
      // Arrange
      const password = 'PlainPassword123!';
      const hashedPassword = 'hashed-password';

      (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Act
      const result = await service.hash(password);

      // Assert
      expect(result).toBe(hashedPassword);
      expect(argon2.hash).toHaveBeenCalledTimes(1);
      expect(argon2.hash).toHaveBeenCalledWith(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      });
    });
  });

  describe('verify', () => {
    it('debe retornar true cuando la contraseña coincide con el hash', async () => {
      // Arrange
      const password = 'PlainPassword123!';
      const hash = 'hashed-password';

      (argon2.verify as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.verify(hash, password);

      // Assert
      expect(result).toBe(true);
      expect(argon2.verify).toHaveBeenCalledTimes(1);
      expect(argon2.verify).toHaveBeenCalledWith(hash, password);
    });

    it('debe retornar false cuando la contraseña no coincide con el hash', async () => {
      // Arrange
      const password = 'WrongPassword!';
      const hash = 'hashed-password';

      (argon2.verify as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.verify(hash, password);

      // Assert
      expect(result).toBe(false);
      expect(argon2.verify).toHaveBeenCalledTimes(1);
    });
  });
});
