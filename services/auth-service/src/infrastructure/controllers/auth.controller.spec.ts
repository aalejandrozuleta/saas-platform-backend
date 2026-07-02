import { Test, type TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '@application/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '@application/use-cases/change-password.use-case';
import { LogoutUseCase } from '@application/use-cases/logout.use-case';
import { LogoutAllUseCase } from '@application/use-cases/logout-all.use-case';
import { Enable2faUseCase } from '@application/use-cases/enable-2fa.use-case';
import { Verify2faUseCase } from '@application/use-cases/verify-2fa.use-case';
import { Disable2faUseCase } from '@application/use-cases/disable-2fa.use-case';
import { GetTrustedCountriesUseCase } from '@application/use-cases/get-trusted-countries.use-case';
import { AddTrustedCountryUseCase } from '@application/use-cases/add-trusted-country.use-case';
import { RemoveTrustedCountryUseCase } from '@application/use-cases/remove-trusted-country.use-case';
import { GetSessionsUseCase } from '@application/use-cases/get-sessions.use-case';
import { RevokeSessionUseCase } from '@application/use-cases/revoke-session.use-case';
import { VerifyEmailUseCase } from '@application/use-cases/verify-email.use-case';
import { ResendVerificationUseCase } from '@application/use-cases/resend-verification.use-case';
import { I18nService } from '@saas/shared';
import { type RegisterUserDto } from '@application/dto/register/register-user.dto';
import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUserUseCase: jest.Mocked<RegisterUserUseCase>;
  let loginUserUseCase: jest.Mocked<LoginUserUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  let changePasswordUseCase: jest.Mocked<ChangePasswordUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;
  let logoutAllUseCase: jest.Mocked<LogoutAllUseCase>;
  let enable2faUseCase: jest.Mocked<Enable2faUseCase>;
  let verify2faUseCase: jest.Mocked<Verify2faUseCase>;
  let disable2faUseCase: jest.Mocked<Disable2faUseCase>;
  let getTrustedCountriesUseCase: jest.Mocked<GetTrustedCountriesUseCase>;
  let addTrustedCountryUseCase: jest.Mocked<AddTrustedCountryUseCase>;
  let removeTrustedCountryUseCase: jest.Mocked<RemoveTrustedCountryUseCase>;
  let getSessionsUseCase: jest.Mocked<GetSessionsUseCase>;
  let revokeSessionUseCase: jest.Mocked<RevokeSessionUseCase>;
  let verifyEmailUseCase: jest.Mocked<VerifyEmailUseCase>;
  let resendVerificationUseCase: jest.Mocked<ResendVerificationUseCase>;
  let i18n: jest.Mocked<I18nService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegisterUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: LoginUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RefreshTokenUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ChangePasswordUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LogoutUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LogoutAllUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: Enable2faUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: Verify2faUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: Disable2faUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetTrustedCountriesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AddTrustedCountryUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RemoveTrustedCountryUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetSessionsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RevokeSessionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: VerifyEmailUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ResendVerificationUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: I18nService,
          useValue: {
            translate: jest.fn((key: string) => key),
            resolveLanguage: jest.fn((lang?: string) =>
              lang?.startsWith('es') ? 'es' : 'en',
            ),
          },
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get(AuthController);
    registerUserUseCase = module.get(RegisterUserUseCase);
    loginUserUseCase = module.get(LoginUserUseCase);
    refreshTokenUseCase = module.get(RefreshTokenUseCase);
    changePasswordUseCase = module.get(ChangePasswordUseCase);
    logoutUseCase = module.get(LogoutUseCase);
    logoutAllUseCase = module.get(LogoutAllUseCase);
    enable2faUseCase = module.get(Enable2faUseCase);
    verify2faUseCase = module.get(Verify2faUseCase);
    disable2faUseCase = module.get(Disable2faUseCase);
    getTrustedCountriesUseCase = module.get(GetTrustedCountriesUseCase);
    addTrustedCountryUseCase = module.get(AddTrustedCountryUseCase);
    removeTrustedCountryUseCase = module.get(RemoveTrustedCountryUseCase);
    getSessionsUseCase = module.get(GetSessionsUseCase);
    revokeSessionUseCase = module.get(RevokeSessionUseCase);
    verifyEmailUseCase = module.get(VerifyEmailUseCase);
    resendVerificationUseCase = module.get(ResendVerificationUseCase);
    i18n = module.get(I18nService);
  });

  // ──────────────────────────────────────────────────
  // Verify Email / Resend Verification
  // ──────────────────────────────────────────────────

  it('debe verificar el email con el token recibido', async () => {
    verifyEmailUseCase.execute.mockResolvedValue(undefined);
    i18n.translate.mockReturnValue('Email verificado correctamente');

    const req: any = {
      headers: { 'accept-language': 'es' },
      get: (key: string) => req.headers[key],
    };

    const result = await controller.verifyEmail({ token: 'verify-token' }, req);

    expect(verifyEmailUseCase.execute).toHaveBeenCalledWith('verify-token');
    expect(i18n.translate).toHaveBeenCalledWith('auth.email_verified', 'es');
    expect(result).toEqual({
      success: true,
      message: 'Email verificado correctamente',
      data: {},
    });
  });

  it('debe reenviar el email de verificación', async () => {
    resendVerificationUseCase.execute.mockResolvedValue(undefined);
    i18n.translate.mockReturnValue('Correo de verificación reenviado');

    const req: any = {
      headers: { 'accept-language': 'es' },
      get: (key: string) => req.headers[key],
    };

    const result = await controller.resendVerification(
      { email: 'test@example.com' },
      req,
    );

    expect(resendVerificationUseCase.execute).toHaveBeenCalledWith('test@example.com');
    expect(i18n.translate).toHaveBeenCalledWith('auth.verification_email_sent', 'es');
    expect(result).toEqual({
      success: true,
      message: 'Correo de verificación reenviado',
      data: {},
    });
  });

  it('debe registrar usuario y devolver respuesta en español', async () => {
    const user = User.create({
      id: 'uuid-test',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'hash',
    });

    registerUserUseCase.execute.mockResolvedValue(user);
    i18n.translate.mockReturnValue('Usuario registrado correctamente');

    const dto: RegisterUserDto = {
      email: 'test@example.com',
      password: 'Str0ng-P@ssword',
    };

    const req: any = {
      ip: '127.0.0.1',
      headers: {
        'accept-language': 'es',
        'x-country': 'CO',
        'x-device-fingerprint': 'device-123',
      },
      get: (key: string) => {
        return key === 'accept-language' ? 'es' : undefined;
      },
    };

    const result = await controller.register(dto, req);

    expect(registerUserUseCase.execute).toHaveBeenCalledWith(
      dto.email,
      dto.password,
      {
        ip: '127.0.0.1',
        country: 'CO',
        deviceFingerprint: 'device-123',
      },
    );

    expect(i18n.translate).toHaveBeenCalledWith(
      'auth.register_success',
      'es',
    );

    expect(result).toEqual({
      success: true,
      message: 'Usuario registrado correctamente',
      data: {
        id: 'uuid-test',
        email: 'test@example.com',
      },
    });
  });

  it('debe devolver access token y cookie en login', async () => {
    loginUserUseCase.execute.mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
    });
    i18n.translate.mockReturnValue('Inicio de sesión exitoso');

    const req: any = {
      ip: '127.0.0.1',
      secure: false,
      headers: {
        'accept-language': 'es',
        'x-country': 'CO',
        'x-device-fingerprint': 'device-123',
        'x-forwarded-proto': 'https',
      },
      get: (key: string) => req.headers[key],
    };

    const res: any = {
      cookie: jest.fn(),
    };

    const result = await controller.login(
      {
        email: 'test@example.com',
        password: 'Str0ng-P@ssword',
      },
      req,
      res,
    );

    // El token va en cookie httpOnly — no en el body de la respuesta
    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      'access-token',
      expect.objectContaining({ secure: true, httpOnly: true }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({ secure: true, httpOnly: true }),
    );
    expect(result).toEqual({
      success: true,
      data: {
        message: 'Inicio de sesión exitoso',
      },
    });
  });

  it('debe renovar token y devolver cookie actualizada', async () => {
    refreshTokenUseCase.execute.mockResolvedValue({
      token: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    i18n.translate.mockReturnValue('Token renovado correctamente');

    const req: any = {
      secure: true,
      cookies: {
        refreshToken: 'old-refresh-token',
      },
      headers: {
        'accept-language': 'es',
      },
      get: (key: string) => req.headers[key],
    };

    const res: any = {
      cookie: jest.fn(),
    };

    const result = await controller.refresh(req, res);

    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(
      'old-refresh-token',
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'new-refresh-token',
      expect.objectContaining({
        secure: true,
      }),
    );
    expect(result).toEqual({
      success: true,
      message: 'Token renovado correctamente',
      data: {
        token: 'new-access-token',
      },
    });
  });

  it('debe devolver string vacío cuando req.ip es undefined y no hay x-forwarded-for', async () => {
    const user = User.create({
      id: 'uuid-test',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'hash',
    });
    registerUserUseCase.execute.mockResolvedValue(user);

    const req: any = {
      // ip undefined
      headers: {
        'accept-language': 'es',
        'x-country': 'CO',
        'x-device-fingerprint': 'fp',
      },
      get: (key: string) => req.headers[key],
    };

    await controller.register({ email: 'test@example.com', password: 'P@ssw0rd123' }, req);

    expect(registerUserUseCase.execute).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ ip: '' }),
    );
  });

  it('debe ignorar headers con valor de tipo array en getHeader', async () => {
    const user = User.create({
      id: 'uuid-test',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'hash',
    });
    registerUserUseCase.execute.mockResolvedValue(user);

    const req: any = {
      ip: '127.0.0.1',
      headers: {
        'accept-language': 'es',
        'x-country': ['CO', 'MX'], // array → no es string → getHeader retorna undefined
        'x-device-fingerprint': 'fp',
      },
      get: (key: string) => req.headers[key],
    };

    await controller.register({ email: 'test@example.com', password: 'P@ssw0rd123' }, req);

    expect(registerUserUseCase.execute).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ country: undefined }),
    );
  });

  it('debe resolver la IP del cliente desde x-forwarded-for cuando está presente', async () => {
    const user = User.create({
      id: 'uuid-test',
      email: EmailVO.create('test@example.com'),
      passwordHash: 'hash',
    });
    registerUserUseCase.execute.mockResolvedValue(user);

    const req: any = {
      ip: '10.0.0.1', // ip real del proxy
      headers: {
        'accept-language': 'es',
        'x-forwarded-for': '203.0.113.1, 10.0.0.2', // ip del cliente real
        'x-country': 'CO',
        'x-device-fingerprint': 'fp-xyz',
      },
      get: (key: string) => req.headers[key],
    };

    await controller.register({ email: 'test@example.com', password: 'P@ssw0rd123' }, req);

    expect(registerUserUseCase.execute).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ ip: '203.0.113.1' }),
    );
  });

  it('debe cambiar la contraseña del usuario autenticado', async () => {
    changePasswordUseCase.execute.mockResolvedValue(undefined);
    i18n.translate.mockReturnValue('Contraseña actualizada correctamente');

    const req: any = {
      ip: '127.0.0.1',
      user: { id: 'user-1', sessionId: 'session-1', role: 'USER' },
      headers: {
        'accept-language': 'es',
        'x-country': 'CO',
      },
      get: (key: string) => req.headers[key],
    };

    const result = await controller.changePassword(
      {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword456@',
      },
      req,
    );

    expect(changePasswordUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'OldPassword123!',
      'NewPassword456@',
      {
        ip: '127.0.0.1',
        country: 'CO',
      },
    );

    expect(i18n.translate).toHaveBeenCalledWith(
      'auth.change_password_success',
      'es',
    );

    expect(result).toEqual({
      success: true,
      message: 'Contraseña actualizada correctamente',
      data: {},
    });
  });

  it('debe cerrar la sesión actual y limpiar cookies', async () => {
    logoutUseCase.execute.mockResolvedValue(undefined);
    i18n.translate.mockReturnValue('Sesión cerrada correctamente');

    const req: any = {
      secure: false,
      user: { id: 'user-1', sessionId: 'session-1', role: 'USER' },
      headers: {
        'accept-language': 'es',
        'x-country': 'CO',
        'x-forwarded-proto': 'https',
      },
      get: (key: string) => req.headers[key],
    };

    const clearCookie = jest.fn();
    const res: any = { clearCookie };

    const result = await controller.logout(req, res);

    expect(logoutUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'session-1',
      expect.objectContaining({ ip: expect.any(String) }),
    );
    expect(clearCookie).toHaveBeenCalledWith('accessToken', expect.any(Object));
    expect(clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
    expect(result).toEqual({
      success: true,
      message: 'Sesión cerrada correctamente',
      data: {},
    });
  });

  // ──────────────────────────────────────────────────
  // 2FA
  // ──────────────────────────────────────────────────

  it('debe iniciar activación de 2FA y devolver setup TOTP', async () => {
    const setup = {
      secret: 'JBSWY3DPEHPK3PXP',
      otpauthUrl: 'otpauth://totp/...',
      qrCode: 'data:image/png;base64,...',
    };
    enable2faUseCase.execute.mockResolvedValue(setup);
    i18n.translate.mockReturnValue('2FA iniciado correctamente');

    const req: any = {
      ip: '127.0.0.1',
      user: { id: 'user-1', sessionId: 'session-1', role: 'USER' },
      headers: {
        'accept-language': 'es',
        'x-country': 'CO',
      },
      get: (key: string) => req.headers[key],
    };

    const result = await controller.enable2fa({ password: 'ValidPass123!' }, req);

    expect(enable2faUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'ValidPass123!',
      { ip: '127.0.0.1', country: 'CO' },
    );
    expect(result).toEqual({
      success: true,
      message: '2FA iniciado correctamente',
      data: setup,
    });
  });

  it('debe verificar código TOTP y devolver códigos de recuperación', async () => {
    const recoveryCodes = ['AAAA-BBBB', 'CCCC-DDDD'];
    verify2faUseCase.execute.mockResolvedValue({ recoveryCodes });
    i18n.translate.mockReturnValue('2FA activado correctamente');

    const req: any = {
      ip: '127.0.0.1',
      user: { id: 'user-1', sessionId: 'session-1', role: 'USER' },
      headers: {
        'accept-language': 'es',
        'x-country': 'CO',
      },
      get: (key: string) => req.headers[key],
    };

    const result = await controller.verify2fa({ totpCode: '123456' }, req);

    expect(verify2faUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      '123456',
      { ip: '127.0.0.1', country: 'CO' },
    );
    expect(result).toEqual({
      success: true,
      message: '2FA activado correctamente',
      data: { recoveryCodes },
    });
  });

  it('debe desactivar 2FA correctamente', async () => {
    disable2faUseCase.execute.mockResolvedValue(undefined);
    i18n.translate.mockReturnValue('2FA desactivado correctamente');

    const req: any = {
      ip: '127.0.0.1',
      user: { id: 'user-1', sessionId: 'session-1', role: 'USER' },
      headers: {
        'accept-language': 'es',
        'x-country': 'CO',
      },
      get: (key: string) => req.headers[key],
    };

    const result = await controller.disable2fa(
      { password: 'ValidPass123!', totpCode: '123456' },
      req,
    );

    expect(disable2faUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'ValidPass123!',
      '123456',
      { ip: '127.0.0.1', country: 'CO' },
    );
    expect(result).toEqual({
      success: true,
      message: '2FA desactivado correctamente',
      data: {},
    });
  });

  it('debe cerrar todas las sesiones y retornar el número revocado', async () => {
    logoutAllUseCase.execute.mockResolvedValue({ revokedCount: 4 });
    i18n.translate.mockReturnValue('Todas las sesiones han sido cerradas');

    const req: any = {
      secure: true,
      user: { id: 'user-1', sessionId: 'session-1', role: 'USER' },
      headers: {
        'accept-language': 'es',
        'x-country': 'CO',
      },
      get: (key: string) => req.headers[key],
    };

    const clearCookie = jest.fn();
    const res: any = { clearCookie };

    const result = await controller.logoutAll(req, res);

    expect(logoutAllUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ ip: expect.any(String) }),
    );
    expect(clearCookie).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      success: true,
      message: 'Todas las sesiones han sido cerradas',
      data: { revokedCount: 4 },
    });
  });

  // ──────────────────────────────────────────────────
  // Trusted Countries
  // ──────────────────────────────────────────────────

  it('debe listar los países de confianza del usuario', async () => {
    getTrustedCountriesUseCase.execute.mockResolvedValue({ countries: ['CO', 'US'] });

    const req: any = {
      user: { id: 'user-1', sessionId: 'session-1', role: 'USER' },
      headers: { 'accept-language': 'es' },
      get: (key: string) => req.headers[key],
    };

    const result = await controller.getTrustedCountries(req);

    expect(getTrustedCountriesUseCase.execute).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({
      success: true,
      data: { countries: ['CO', 'US'] },
    });
  });

  it('debe agregar un país de confianza', async () => {
    addTrustedCountryUseCase.execute.mockResolvedValue(undefined);
    i18n.translate.mockReturnValue('País de confianza agregado');

    const req: any = {
      user: { id: 'user-1', sessionId: 'session-1', role: 'USER' },
      headers: { 'accept-language': 'es' },
      get: (key: string) => req.headers[key],
    };

    const result = await controller.addTrustedCountry({ country: 'MX' }, req);

    expect(addTrustedCountryUseCase.execute).toHaveBeenCalledWith('user-1', 'MX');
    expect(result).toEqual({
      success: true,
      message: 'País de confianza agregado',
      data: {},
    });
  });

  it('debe eliminar un país de confianza', async () => {
    removeTrustedCountryUseCase.execute.mockResolvedValue(undefined);
    i18n.translate.mockReturnValue('País de confianza eliminado');

    const req: any = {
      user: { id: 'user-1', sessionId: 'session-1', role: 'USER' },
      headers: { 'accept-language': 'es' },
      get: (key: string) => req.headers[key],
    };

    const result = await controller.removeTrustedCountry('MX', req);

    expect(removeTrustedCountryUseCase.execute).toHaveBeenCalledWith('user-1', 'MX');
    expect(result).toEqual({
      success: true,
      message: 'País de confianza eliminado',
      data: {},
    });
  });

  // ──────────────────────────────────────────────────
  // Sessions
  // ──────────────────────────────────────────────────

  it('debe listar las sesiones activas del usuario', async () => {
    const sessions = [{ id: 'session-1', current: true }];
    getSessionsUseCase.execute.mockResolvedValue(sessions as any);
    i18n.translate.mockReturnValue('Sesiones obtenidas correctamente');

    const req: any = {
      user: { id: 'user-1', sessionId: 'session-1', role: 'USER' },
      headers: { 'accept-language': 'es' },
      get: (key: string) => req.headers[key],
    };

    const result = await controller.getSessions(req);

    expect(getSessionsUseCase.execute).toHaveBeenCalledWith('user-1', 'session-1');
    expect(result).toEqual({
      success: true,
      message: 'Sesiones obtenidas correctamente',
      data: { sessions },
    });
  });

  it('debe revocar una sesión específica', async () => {
    revokeSessionUseCase.execute.mockResolvedValue(undefined);
    i18n.translate.mockReturnValue('Sesión revocada correctamente');

    const req: any = {
      ip: '127.0.0.1',
      user: { id: 'user-1', sessionId: 'session-1', role: 'USER' },
      headers: { 'accept-language': 'es', 'x-country': 'CO' },
      get: (key: string) => req.headers[key],
    };

    const result = await controller.revokeSession('session-2', req);

    expect(revokeSessionUseCase.execute).toHaveBeenCalledWith(
      'user-1',
      'session-2',
      { ip: '127.0.0.1', country: 'CO' },
    );
    expect(result).toEqual({
      success: true,
      message: 'Sesión revocada correctamente',
      data: {},
    });
  });
});
