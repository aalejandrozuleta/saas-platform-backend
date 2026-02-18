import {
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { RegisterUserDto } from '@application/dto/register/register-user.dto';
import { LoginUserDto } from '@application/dto/login/login-user.dto';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '@application/use-cases/login-user.use-case';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { I18nService } from '@saas/shared';
import { Request } from 'express';

/**
 * Controller de autenticación
 *
 * Responsabilidades:
 * - Orquestar DTO → UseCase
 * - Construir contexto de login
 * - Resolver idioma
 *
 * No contiene lógica de negocio.
 */
@Controller({ version: '1' })
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Registro de usuario
   */
  @Post('register')
  async register(
    @Body() dto: RegisterUserDto,
    @Req() req: Request,
  ) {
    const lang = this.resolveLanguage(req);

    const user = await this.registerUserUseCase.execute(
      dto.email,
      dto.password,
      {
        ip: this.resolveClientIp(req),
        country: this.getHeader(req, 'x-country'),
        deviceFingerprint: this.getHeader(req, 'x-device-fingerprint'),
      },
    );

    return {
      message: this.i18n.translate('REGISTER_SUCCESS', lang),
      data: {
        id: user.id,
        email: user.email.getValue(),
      },
    };
  }

  /**
   * Login de usuario
   */
  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: Request,
  ) {
    const context = LoginContext.create({
      ip: this.resolveClientIp(req),
      country: this.getHeader(req, 'x-country'),
      deviceFingerprint: this.getHeader(req, 'x-device-fingerprint'),
    });

    return this.loginUserUseCase.execute(
      dto.email,
      dto.password,
      context,
    );
  }

  /**
   * Resuelve idioma desde Accept-Language
   */
  private resolveLanguage(req: Request): 'es' | 'en' {
    const header = req.get('accept-language');
    return header?.startsWith('es') ? 'es' : 'en';
  }

  /**
   * Obtiene IP real considerando reverse proxy
   *
   * Requiere:
   * app.set('trust proxy', true);
   */
  private resolveClientIp(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'] as
      | string
      | undefined;

    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    return req.ip ?? '';
  }

  /**
   * Helper tipado para lectura segura de headers
   */
  private getHeader(
    req: Request,
    key: string,
  ): string | undefined {
    const value = req.headers[key.toLowerCase()];
    return typeof value === 'string' ? value : undefined;
  }
}
