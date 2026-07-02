import { type PlatformLogger } from '@saas/shared';
import { type UserRepository } from '@domain/repositories/user.repository';
import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';

import { VerifyEmailUseCase } from './verify-email.use-case';

describe('VerifyEmailUseCase', () => {
  let useCase: VerifyEmailUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let logger: jest.Mocked<PlatformLogger>;

  const makeUser = (overrides: Partial<{ expiresAt: Date }> = {}) =>
    User.fromPersistence({
      id: 'user-1',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'hash',
      role: 'CUSTOMER' as any,
      status: 'PENDING' as any,
      emailVerified: false,
      emailVerificationToken: 'valid-token',
      emailVerificationExpiresAt:
        overrides.expiresAt ?? new Date(Date.now() + 60_000),
      failedLoginAttempts: 0,
      lockoutCount: 0,
      createdAt: new Date(),
    });

  beforeEach(() => {
    userRepository = {
      findByVerificationToken: jest.fn(),
      update: jest.fn(),
    } as any;

    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as jest.Mocked<PlatformLogger>;

    useCase = new VerifyEmailUseCase(userRepository, logger);
  });

  it('debe verificar el email y actualizar el usuario', async () => {
    const user = makeUser();
    userRepository.findByVerificationToken.mockResolvedValue(user);

    await useCase.execute('valid-token');

    expect(userRepository.findByVerificationToken).toHaveBeenCalledWith('valid-token');
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ emailVerified: true }),
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Email verificado correctamente',
      { userId: user.id },
    );
  });

  it('debe lanzar error si el token no corresponde a ningún usuario', async () => {
    userRepository.findByVerificationToken.mockResolvedValue(null);

    await expect(useCase.execute('invalid-token')).rejects.toMatchObject({
      code: 'INVALID_VERIFICATION_TOKEN',
    });

    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('debe lanzar error si el token está expirado', async () => {
    const user = makeUser({ expiresAt: new Date(Date.now() - 1000) });
    userRepository.findByVerificationToken.mockResolvedValue(user);

    await expect(useCase.execute('expired-token')).rejects.toMatchObject({
      code: 'INVALID_VERIFICATION_TOKEN',
    });

    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
