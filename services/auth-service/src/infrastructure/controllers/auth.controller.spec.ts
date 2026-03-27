import { Test, type TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '@application/use-cases/login-user.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/refresh-token.use-case';
import { I18nService } from '@saas/shared';
import { type RegisterUserDto } from '@application/dto/register/register-user.dto';
import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';

import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUserUseCase: jest.Mocked<RegisterUserUseCase>;
  let loginUserUseCase: jest.Mocked<LoginUserUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
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
          provide: I18nService,
          useValue: {
            translate: jest.fn((key: string) => key),
            resolveLanguage: jest.fn((lang?: string) =>
              lang?.startsWith('es') ? 'es' : 'en',
            ),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    registerUserUseCase = module.get(RegisterUserUseCase);
    loginUserUseCase = module.get(LoginUserUseCase);
    refreshTokenUseCase = module.get(RefreshTokenUseCase);
    i18n = module.get(I18nService);
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

    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({
        secure: true,
      }),
    );
    expect(result).toEqual({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token: 'access-token',
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
});
