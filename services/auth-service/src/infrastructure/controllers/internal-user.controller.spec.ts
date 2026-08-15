import { Test, type TestingModule } from '@nestjs/testing';
import { LookupUserByEmailUseCase } from '@application/use-cases/user/lookup-user-by-email.use-case';
import { InternalServiceGuard } from '@infrastructure/security/internal-service.guard';

import { InternalUserController } from './internal-user.controller';

describe('InternalUserController', () => {
  let controller: InternalUserController;
  let lookupUserByEmailUseCase: jest.Mocked<LookupUserByEmailUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalUserController],
      providers: [{ provide: LookupUserByEmailUseCase, useValue: { execute: jest.fn() } }],
    })
      .overrideGuard(InternalServiceGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(InternalUserController);
    lookupUserByEmailUseCase = module.get(LookupUserByEmailUseCase);
  });

  it('debe resolver el userId a partir del email', async () => {
    lookupUserByEmailUseCase.execute.mockResolvedValue({
      userId: 'user-1',
      email: 'juan@example.com',
    });

    const result = await controller.lookup('juan@example.com');

    expect(lookupUserByEmailUseCase.execute).toHaveBeenCalledWith('juan@example.com');
    expect(result).toEqual({
      success: true,
      data: { userId: 'user-1', email: 'juan@example.com' },
    });
  });
});
