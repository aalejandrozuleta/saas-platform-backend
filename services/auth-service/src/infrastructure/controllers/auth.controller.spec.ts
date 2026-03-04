import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '@application/use-cases/login-user.use-case';
import { I18nService } from '@saas/shared';
import { RegisterUserDto } from '@application/dto/register/register-user.dto';
import { User } from '@domain/entities/user/user.entity';
import { EmailVO } from '@domain/value-objects/email.vo';

import { AuthController } from './auth.controller';

/**
 * Tests unitarios del AuthController.
 *
 * - No levanta servidor HTTP.
 * - No usa supertest.
 * - Aísla completamente el controller.
 */
describe('AuthController', () => {
  let controller: AuthController;
  let registerUserUseCase: jest.Mocked<RegisterUserUseCase>;
  let loginUserUseCase: jest.Mocked<LoginUserUseCase>;
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
          provide: I18nService,
          useValue: {
            translate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    registerUserUseCase = module.get(RegisterUserUseCase);
    loginUserUseCase = module.get(LoginUserUseCase);
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
      'REGISTER_SUCCESS',
      'es',
    );

    expect(result).toEqual({
      message: 'Usuario registrado correctamente',
      data: {
        id: 'uuid-test',
        email: 'test@example.com',
      },
    });
  });
});