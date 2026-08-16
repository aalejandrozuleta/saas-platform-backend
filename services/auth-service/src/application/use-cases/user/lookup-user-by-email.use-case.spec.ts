import { ErrorCode } from '@saas/shared';
import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';

import { LookupUserByEmailUseCase } from './lookup-user-by-email.use-case';

describe('LookupUserByEmailUseCase', () => {
  let useCase: LookupUserByEmailUseCase;
  let userRepo: any;

  beforeEach(() => {
    userRepo = {
      findByEmail: jest.fn(),
    };

    useCase = new LookupUserByEmailUseCase(userRepo);
  });

  it('debe devolver userId y email si el usuario existe', async () => {
    const user = User.create({
      id: 'user-1',
      email: EmailVO.create('juan@example.com'),
      passwordHash: 'hashed',
    });
    userRepo.findByEmail.mockResolvedValue(user);

    const result = await useCase.execute('juan@example.com');

    expect(userRepo.findByEmail).toHaveBeenCalledWith(expect.any(EmailVO));
    expect(result).toEqual({ userId: 'user-1', email: 'juan@example.com' });
  });

  it('debe lanzar USER_NOT_FOUND si no existe un usuario con ese email', async () => {
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute('inexistente@example.com')).rejects.toMatchObject({
      code: ErrorCode.USER_NOT_FOUND,
    });
  });

  it('debe propagar el error si el email es inválido', async () => {
    await expect(useCase.execute('not-an-email')).rejects.toThrow('INVALID_EMAIL');
    expect(userRepo.findByEmail).not.toHaveBeenCalled();
  });
});
