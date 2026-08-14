import { SECURITY_REPOSITORY, RECOVERY_CODE_REPOSITORY } from '@domain/token/repositories.tokens';
import { PASSWORD_HASHER, DOMAIN_EVENT_BUS, TOTP_SERVICE } from '@domain/token/services.tokens';
import { DomainException } from '@domain/errors/domain.exception';
import { Test, type TestingModule } from '@nestjs/testing';

import { Verify2faUseCase } from './verify-2fa.use-case';

describe('Verify2faUseCase', () => {
  let useCase: Verify2faUseCase;
  let securityRepository: any;
  let recoveryCodeRepository: any;
  let passwordHasher: any;
  let totpService: any;
  let eventBus: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Verify2faUseCase,
        {
          provide: SECURITY_REPOSITORY,
          useValue: {
            getTotpPendingSecret: jest.fn(),
            activateTwoFactor: jest.fn(),
          },
        },
        {
          provide: RECOVERY_CODE_REPOSITORY,
          useValue: {
            deleteAllByUser: jest.fn(),
            createMany: jest.fn(),
          },
        },
        { provide: PASSWORD_HASHER, useValue: { hash: jest.fn() } },
        { provide: TOTP_SERVICE, useValue: { verifyToken: jest.fn() } },
        { provide: DOMAIN_EVENT_BUS, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(Verify2faUseCase);
    securityRepository = module.get(SECURITY_REPOSITORY);
    recoveryCodeRepository = module.get(RECOVERY_CODE_REPOSITORY);
    passwordHasher = module.get(PASSWORD_HASHER);
    totpService = module.get(TOTP_SERVICE);
    eventBus = module.get(DOMAIN_EVENT_BUS);
  });

  const ctx = { ip: '127.0.0.1' };

  it('debe activar 2FA y devolver códigos de recuperación', async () => {
    securityRepository.getTotpPendingSecret.mockResolvedValue('PENDING_SECRET');
    totpService.verifyToken.mockReturnValue(true);
    passwordHasher.hash.mockResolvedValue('hashed-code');

    const result = await useCase.execute('user-1', '123456', ctx);

    expect(securityRepository.activateTwoFactor).toHaveBeenCalledWith('user-1');
    expect(recoveryCodeRepository.deleteAllByUser).toHaveBeenCalledWith('user-1');
    expect(recoveryCodeRepository.createMany).toHaveBeenCalledWith('user-1', expect.any(Array));
    expect(result.recoveryCodes).toHaveLength(8);
    expect(typeof result.recoveryCodes[0]).toBe('string');
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it('debe lanzar error si no hay secreto pendiente', async () => {
    securityRepository.getTotpPendingSecret.mockResolvedValue(null);

    await expect(useCase.execute('user-1', '123456', ctx)).rejects.toBeInstanceOf(DomainException);
  });

  it('debe lanzar error si el código TOTP es inválido', async () => {
    securityRepository.getTotpPendingSecret.mockResolvedValue('PENDING_SECRET');
    totpService.verifyToken.mockReturnValue(false);

    await expect(useCase.execute('user-1', '000000', ctx)).rejects.toBeInstanceOf(DomainException);
  });
});
