import {
  USER_REPOSITORY,
  SECURITY_REPOSITORY,
  RECOVERY_CODE_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { PASSWORD_HASHER, DOMAIN_EVENT_BUS, TOTP_SERVICE } from '@domain/token/services.tokens';
import { UserStatus } from '@domain/enums/user-status.enum';
import { DomainException } from '@domain/errors/domain.exception';
import { Test, type TestingModule } from '@nestjs/testing';
import { EmailVO } from '@domain/value-objects/email.vo';
import { RecoveryCodesRegeneratedEvent } from '@application/events/two-factor/recovery-codes-regenerated.event';

import { RegenerateRecoveryCodesUseCase } from './regenerate-recovery-codes.use-case';

const mockUser = {
  status: UserStatus.ACTIVE,
  passwordHash: 'hashed-pw',
  email: EmailVO.create('user@example.com'),
};

describe('RegenerateRecoveryCodesUseCase', () => {
  let useCase: RegenerateRecoveryCodesUseCase;
  let userRepository: any;
  let securityRepository: any;
  let recoveryCodeRepository: any;
  let passwordHasher: any;
  let totpService: any;
  let eventBus: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegenerateRecoveryCodesUseCase,
        { provide: USER_REPOSITORY, useValue: { findById: jest.fn() } },
        {
          provide: SECURITY_REPOSITORY,
          useValue: { findByUserId: jest.fn(), getTotpSecret: jest.fn() },
        },
        {
          provide: RECOVERY_CODE_REPOSITORY,
          useValue: { deleteAllByUser: jest.fn(), createMany: jest.fn() },
        },
        { provide: PASSWORD_HASHER, useValue: { verify: jest.fn(), hash: jest.fn() } },
        { provide: TOTP_SERVICE, useValue: { verifyToken: jest.fn() } },
        { provide: DOMAIN_EVENT_BUS, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(RegenerateRecoveryCodesUseCase);
    userRepository = module.get(USER_REPOSITORY);
    securityRepository = module.get(SECURITY_REPOSITORY);
    recoveryCodeRepository = module.get(RECOVERY_CODE_REPOSITORY);
    passwordHasher = module.get(PASSWORD_HASHER);
    totpService = module.get(TOTP_SERVICE);
    eventBus = module.get(DOMAIN_EVENT_BUS);
  });

  const ctx = { ip: '127.0.0.1' };

  it('debe regenerar 8 códigos nuevos cuando contraseña y TOTP son correctos', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(true);
    passwordHasher.hash.mockResolvedValue('hashed-code');
    securityRepository.findByUserId.mockResolvedValue({ twoFactorEnabled: true });
    securityRepository.getTotpSecret.mockResolvedValue('ACTIVE_SECRET');
    totpService.verifyToken.mockReturnValue(true);

    const result = await useCase.execute('user-1', 'ValidPass123!', '123456', ctx);

    expect(result.recoveryCodes).toHaveLength(8);
    expect(recoveryCodeRepository.deleteAllByUser).toHaveBeenCalledWith('user-1');
    expect(recoveryCodeRepository.createMany).toHaveBeenCalledWith(
      'user-1',
      expect.arrayContaining(['hashed-code']),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(expect.any(RecoveryCodesRegeneratedEvent));
  });

  it('debe invalidar el lote anterior antes de guardar el nuevo', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(true);
    passwordHasher.hash.mockResolvedValue('hashed-code');
    securityRepository.findByUserId.mockResolvedValue({ twoFactorEnabled: true });
    securityRepository.getTotpSecret.mockResolvedValue('ACTIVE_SECRET');
    totpService.verifyToken.mockReturnValue(true);

    const callOrder: string[] = [];
    recoveryCodeRepository.deleteAllByUser.mockImplementation(async () => {
      callOrder.push('deleteAllByUser');
    });
    recoveryCodeRepository.createMany.mockImplementation(async () => {
      callOrder.push('createMany');
    });

    await useCase.execute('user-1', 'ValidPass123!', '123456', ctx);

    expect(callOrder).toEqual(['deleteAllByUser', 'createMany']);
  });

  it('debe lanzar error si la contraseña es incorrecta', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(useCase.execute('user-1', 'wrongpass', '123456', ctx)).rejects.toBeInstanceOf(
      DomainException,
    );

    expect(recoveryCodeRepository.deleteAllByUser).not.toHaveBeenCalled();
  });

  it('debe lanzar error si el usuario no existe o no está activo', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'ValidPass123!', '123456', ctx)).rejects.toBeInstanceOf(
      DomainException,
    );

    expect(passwordHasher.verify).not.toHaveBeenCalled();
  });

  it('debe lanzar error si 2FA no está habilitado', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(true);
    securityRepository.findByUserId.mockResolvedValue({ twoFactorEnabled: false });

    await expect(useCase.execute('user-1', 'ValidPass123!', '123456', ctx)).rejects.toBeInstanceOf(
      DomainException,
    );
  });

  it('debe lanzar error si el código TOTP es inválido', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(true);
    securityRepository.findByUserId.mockResolvedValue({ twoFactorEnabled: true });
    securityRepository.getTotpSecret.mockResolvedValue('ACTIVE_SECRET');
    totpService.verifyToken.mockReturnValue(false);

    await expect(useCase.execute('user-1', 'ValidPass123!', '000000', ctx)).rejects.toBeInstanceOf(
      DomainException,
    );

    expect(recoveryCodeRepository.deleteAllByUser).not.toHaveBeenCalled();
  });

  it('debe lanzar error si no hay secreto TOTP activo', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(true);
    securityRepository.findByUserId.mockResolvedValue({ twoFactorEnabled: true });
    securityRepository.getTotpSecret.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'ValidPass123!', '123456', ctx)).rejects.toBeInstanceOf(
      DomainException,
    );
  });
});
