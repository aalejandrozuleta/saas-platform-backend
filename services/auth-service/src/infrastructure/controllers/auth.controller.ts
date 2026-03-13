import {
  Body,
  Controller,
  Post,
  Req,
  Res
} from '@nestjs/common';
import { RegisterUserDto } from '@application/dto/register/register-user.dto';
import { LoginUserDto } from '@application/dto/login/login-user.dto';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '@application/use-cases/login-user.use-case';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { I18nService } from '@saas/shared';
import { Request, Response } from 'express';
import { RegisterSwagger } from '@infrastructure/swagger/register.swagger';
import { LoginSwagger } from '@infrastructure/swagger/login.swagger';
import { ApiTags } from '@nestjs/swagger';
import { RefreshTokenUseCase } from '@application/use-cases/refresh-token.use-case';

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
@ApiTags('Auth')
@Controller({ version: '1' })
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly i18n: I18nService,
  ) { }

  /**
   * Registro de usuario
   */
  @Post('register')
  @RegisterSwagger()
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
      message: this.i18n.translate('auth.register_success', lang),
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
  @LoginSwagger()
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {

    const context = LoginContext.create({
      ip: this.resolveClientIp(req),
      country: this.getHeader(req, 'x-country'),
      deviceFingerprint: this.getHeader(req, 'x-device-fingerprint'),
    });

    const result = await this.loginUserUseCase.execute(
      dto.email,
      dto.password,
      context,
    );

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.shouldUseSecureCookies(req),
      sameSite: 'strict',
      path: '/v1/auth/refresh',
    });

    return {
      message: this.i18n.translate(
        'auth.login_success',
        this.resolveLanguage(req),
      ),
      data: {
        token: result.token,
      },
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {

    const refreshToken = req.cookies?.refreshToken;

    const result = await this.refreshTokenUseCase.execute(
      refreshToken,
    );

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: this.shouldUseSecureCookies(req),
      sameSite: 'strict',
      path: '/v1/auth/refresh',
    });

    return {
      message: this.i18n.translate(
        'auth.refresh_success',
        this.resolveLanguage(req),
      ),
      data: {
        token: result.token,
      },
    };
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

  private shouldUseSecureCookies(req: Request): boolean {
    const forwardedProto = req.get('x-forwarded-proto');
    return req.secure || forwardedProto === 'https';
  }
}
