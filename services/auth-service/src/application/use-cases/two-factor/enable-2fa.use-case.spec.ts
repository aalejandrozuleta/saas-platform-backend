import { USER_REPOSITORY, SECURITY_REPOSITORY } from '@domain/token/repositories.tokens';
import { PASSWORD_HASHER, DOMAIN_EVENT_BUS, TOTP_SERVICE } from '@domain/token/services.tokens';
import { UserStatus } from '@domain/enums/user-status.enum';
import { DomainException } from '@domain/errors/domain.exception';
import { Test, type TestingModule } from '@nestjs/testing';
import { EmailVO } from '@domain/value-objects/email.vo';

import { Enable2faUseCase } from './enable-2fa.use-case';

const mockUser = {
  status: UserStatus.ACTIVE,
  passwordHash: 'hashed-pw',
  email: EmailVO.create('user@example.com'),
};

const mockSetup = {
  secret: 'JBSWY3DPEHPK3PXP',
  otpauthUrl: 'otpauth://totp/...',
  qrCode: 'data:image/png;base64,...',
};

describe('Enable2faUseCase', () => {
  let useCase: Enable2faUseCase;
  let userRepository: any;
  let securityRepository: any;
  let passwordHasher: any;
  let totpService: any;
  let eventBus: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Enable2faUseCase,
        { provide: USER_REPOSITORY, useValue: { findById: jest.fn() } },
        {
          provide: SECURITY_REPOSITORY,
          useValue: { findByUserId: jest.fn(), saveTotpPendingSecret: jest.fn() },
        },
        { provide: PASSWORD_HASHER, useValue: { verify: jest.fn() } },
        { provide: TOTP_SERVICE, useValue: { generateSecret: jest.fn() } },
        { provide: DOMAIN_EVENT_BUS, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(Enable2faUseCase);
    userRepository = module.get(USER_REPOSITORY);
    securityRepository = module.get(SECURITY_REPOSITORY);
    passwordHasher = module.get(PASSWORD_HASHER);
    totpService = module.get(TOTP_SERVICE);
    eventBus = module.get(DOMAIN_EVENT_BUS);
  });

  const ctx = { ip: '127.0.0.1' };

  it('debe generar el secreto TOTP y guardarlo como pendiente', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(true);
    securityRepository.findByUserId.mockResolvedValue({ twoFactorEnabled: false });
    totpService.generateSecret.mockResolvedValue(mockSetup);

    const result = await useCase.execute('user-1', 'ValidPass123!', ctx);

    expect(totpService.generateSecret).toHaveBeenCalledWith('user@example.com', 'SaaS Platform');
    expect(securityRepository.saveTotpPendingSecret).toHaveBeenCalledWith(
      'user-1',
      mockSetup.secret,
    );
    expect(result).toEqual(mockSetup);
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it('debe lanzar error si la contraseña es incorrecta', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(false);

    await expect(useCase.execute('user-1', 'wrongpass', ctx)).rejects.toBeInstanceOf(
      DomainException,
    );
  });

  it('debe lanzar error si el usuario no está activo', async () => {
    userRepository.findById.mockResolvedValue({ ...mockUser, status: UserStatus.BLOCKED });

    await expect(useCase.execute('user-1', 'pass', ctx)).rejects.toBeInstanceOf(DomainException);
  });

  it('debe lanzar error si 2FA ya está habilitado', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    passwordHasher.verify.mockResolvedValue(true);
    securityRepository.findByUserId.mockResolvedValue({ twoFactorEnabled: true });

    await expect(useCase.execute('user-1', 'ValidPass123!', ctx)).rejects.toBeInstanceOf(
      DomainException,
    );
  });
});
