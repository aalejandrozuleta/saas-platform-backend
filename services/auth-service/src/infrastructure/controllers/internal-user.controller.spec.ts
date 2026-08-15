import { Test, type TestingModule } from '@nestjs/testing';
import { LookupUserByEmailUseCase } from '@application/use-cases/user/lookup-user-by-email.use-case';
import { ProvisionWorkerUseCase } from '@application/use-cases/user/provision-worker.use-case';
import { InternalServiceGuard } from '@infrastructure/security/internal-service.guard';

import { InternalUserController } from './internal-user.controller';

describe('InternalUserController', () => {
  let controller: InternalUserController;
  let lookupUserByEmailUseCase: jest.Mocked<LookupUserByEmailUseCase>;
  let provisionWorkerUseCase: jest.Mocked<ProvisionWorkerUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalUserController],
      providers: [
        { provide: LookupUserByEmailUseCase, useValue: { execute: jest.fn() } },
        { provide: ProvisionWorkerUseCase, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(InternalServiceGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(InternalUserController);
    lookupUserByEmailUseCase = module.get(LookupUserByEmailUseCase);
    provisionWorkerUseCase = module.get(ProvisionWorkerUseCase);
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

  it('debe provisionar un worker nuevo', async () => {
    const dto = {
      firstName: 'María',
      lastName: 'Pérez',
      contactEmail: 'contacto@empresa.com',
      companyName: 'Acme Corp',
    };

    provisionWorkerUseCase.execute.mockResolvedValue({
      userId: 'user-2',
      loginEmail: 'maria.perez@acme-corp.trabajadores.local',
    });

    const result = await controller.provision(dto);

    expect(provisionWorkerUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      success: true,
      data: { userId: 'user-2', loginEmail: 'maria.perez@acme-corp.trabajadores.local' },
    });
  });
});
