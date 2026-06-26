import { Disable2faUseCase } from './disable-2fa.use-case';
import { USER_REPOSITORY, SECURITY_REPOSITORY, RECOVERY_CODE_REPOSITORY } from '@domain/token/repositories.tokens';
import { PASSWORD_HASHER, DOMAIN_EVENT_BUS, TOTP_SERVICE } from '@domain/token/services.tokens';
import { UserStatus } from '@domain/enums/user-status.enum';
import { DomainException } from '@domain/errors/domain.exception';
import { Test, type TestingModule } from '@nestjs/testing';
import { EmailVO } from '@domain/value-objects/email.vo';

const mockUser = {
  status: UserStatus.ACTIVE,
  passwordHash: 'hashed-pw',
  email: EmailVO.create('user@example.com'),
};

describe('Disable2faUseCase', () => {
  let useCase: Disable2faUseCase;
  let userRepository: any;
  let securityRepository: any;
  let recoveryCodeRepository: any;
  let passwordHasher: any;
  let totpService: any;
  let eventBus: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Disable2faUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: { findById: jest.fn() },
        },
        {
          provide: SECURITY_REPOSITORY,
          useValue: {
            findByUserId: jest.fn(),
            getTotpSecret: jest.fn(),
            disableTwoFactor: jest.fn(),
          },
        },
        {
          provide: RECOVERY_CODE_REPOSITORY,
          useValue: { deleteAllByUser: jest.fn() },
        },
        { provide: PASSWORD_HASHER,  useValue: { verify: jest.fn() } },
        { provide: TOTP_SERVICE,     useValue: { verifyToken: jest.fn() } },
        { provide: DOMAIN_EVENT_BUS, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    useCase                = module.get(Disable2faUseCase);
    userRepository         = module.get(USER_REPOSITORY);
    securityRepository     = module.get(SECURITY_REPOSITORY);
    recoveryCodeRepository = module.get(RECOVERY_CODE_REPOSITORY);
    passwordHasher         = module.get(PASSWORD_HASHER);
    totpService            = module.get(TOTP_SERVICE);
    eventBus               = module.get(DOMAIN_EVENT_BUS);
  });

  const ctx = { ip: '127.0.0.1' };

  it('debe desactivar 2FA cuando contraseña y código son correctos', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(true);
    securityRepository.findByUserId.mockResolvedValue({ twoFactorEnabled: true });
    securityRepository.getTotpSecret.mockResolvedValue('ACTIVE_SECRET');
    totpService.verifyToken.mockReturnValue(true);

    await useCase.execute('user-1', 'ValidPass123!', '123456', ctx);

    expect(securityRepository.disableTwoFactor).toHaveBeenCalledWith('user-1');
    expect(recoveryCodeRepository.deleteAllByUser).toHaveBeenCalledWith('user-1');
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it('debe lanzar error si la contraseña es incorrecta', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(useCase.execute('user-1', 'wrongpass', '123456', ctx))
      .rejects.toBeInstanceOf(DomainException);
  });

  it('debe lanzar error si 2FA no está habilitado', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(true);
    securityRepository.findByUserId.mockResolvedValue({ twoFactorEnabled: false });

    await expect(useCase.execute('user-1', 'ValidPass123!', '123456', ctx))
      .rejects.toBeInstanceOf(DomainException);
  });

  it('debe lanzar error si el código TOTP es inválido', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(true);
    securityRepository.findByUserId.mockResolvedValue({ twoFactorEnabled: true });
    securityRepository.getTotpSecret.mockResolvedValue('ACTIVE_SECRET');
    totpService.verifyToken.mockReturnValue(false);

    await expect(useCase.execute('user-1', 'ValidPass123!', '000000', ctx))
      .rejects.toBeInstanceOf(DomainException);
  });
});
