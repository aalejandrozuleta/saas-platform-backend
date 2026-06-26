import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { RegisterUserDto } from '@application/dto/register/register-user.dto';
import { LoginUserDto } from '@application/dto/login/login-user.dto';
import { ChangePasswordDto } from '@application/dto/change-password/change-password.dto';
import { Enable2faDto } from '@application/dto/2fa/enable-2fa.dto';
import { Verify2faDto } from '@application/dto/2fa/verify-2fa.dto';
import { Disable2faDto } from '@application/dto/2fa/disable-2fa.dto';
import { RegisterUserUseCase } from '@application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '@application/use-cases/login-user.use-case';
import { ChangePasswordUseCase } from '@application/use-cases/change-password.use-case';
import { LogoutUseCase } from '@application/use-cases/logout.use-case';
import { LogoutAllUseCase } from '@application/use-cases/logout-all.use-case';
import { Enable2faUseCase } from '@application/use-cases/enable-2fa.use-case';
import { Verify2faUseCase } from '@application/use-cases/verify-2fa.use-case';
import { Disable2faUseCase } from '@application/use-cases/disable-2fa.use-case';
import { GetTrustedCountriesUseCase } from '@application/use-cases/get-trusted-countries.use-case';
import { AddTrustedCountryUseCase } from '@application/use-cases/add-trusted-country.use-case';
import { RemoveTrustedCountryUseCase } from '@application/use-cases/remove-trusted-country.use-case';
import { AddTrustedCountryDto } from '@application/dto/trusted-countries/add-trusted-country.dto';
import { LoginContext } from '@domain/value-objects/login-context.vo';
import { I18nService, successResponse } from '@saas/shared';
import { Request, Response } from 'express';
import { RegisterSwagger } from '@infrastructure/swagger/register.swagger';
import { LoginSwagger } from '@infrastructure/swagger/login.swagger';
import { ChangePasswordSwagger } from '@infrastructure/swagger/change-password.swagger';
import { LogoutSwagger, LogoutAllSwagger } from '@infrastructure/swagger/logout.swagger';
import { Enable2faSwagger, Verify2faSwagger, Disable2faSwagger } from '@infrastructure/swagger/2fa.swagger';
import { GetTrustedCountriesSwagger, AddTrustedCountrySwagger, RemoveTrustedCountrySwagger } from '@infrastructure/swagger/trusted-countries.swagger';
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
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly logoutAllUseCase: LogoutAllUseCase,
    private readonly enable2faUseCase: Enable2faUseCase,
    private readonly verify2faUseCase: Verify2faUseCase,
    private readonly disable2faUseCase: Disable2faUseCase,
    private readonly getTrustedCountriesUseCase: GetTrustedCountriesUseCase,
    private readonly addTrustedCountryUseCase: AddTrustedCountryUseCase,
    private readonly removeTrustedCountryUseCase: RemoveTrustedCountryUseCase,
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

    return successResponse(
      {
        id: user.id,
        email: user.email.getValue(),
      },
      {
        message: this.i18n.translate('auth.register_success', lang),
      },
    );
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

    const secure = this.shouldUseSecureCookies(req);

    res.cookie('accessToken', result.token, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    return successResponse(
      {
        message: this.i18n.translate(
          'auth.login_success',
          this.resolveLanguage(req),
        ),
      },
    );
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
      path: '/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(
      {
        token: result.token,
      },
      {
        message: this.i18n.translate(
          'auth.refresh_success',
          this.resolveLanguage(req),
        ),
      },
    );
  }

  /**
   * Cierra la sesión actual del usuario autenticado.
   *
   * @remarks
   * Revoca la sesión indicada por el sessionId del JWT, invalida
   * el refresh token asociado y elimina la entrada de Redis.
   * Limpia las cookies `accessToken` y `refreshToken`.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @LogoutSwagger()
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const lang = this.resolveLanguage(req);
    const userId = req.user!.id;
    const sessionId = req.user!.sessionId;

    await this.logoutUseCase.execute(
      userId,
      sessionId,
      {
        ip: this.resolveClientIp(req),
        country: this.getHeader(req, 'x-country'),
      },
    );

    this.clearAuthCookies(res);

    return successResponse(
      {},
      {
        message: this.i18n.translate('auth.logout_success', lang),
      },
    );
  }

  /**
   * Cierra **todas** las sesiones activas del usuario.
   *
   * @remarks
   * Útil para cerrar sesión en todos los dispositivos simultáneamente.
   * Revoca todos los refresh tokens del usuario y limpia Redis.
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @LogoutAllSwagger()
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const lang = this.resolveLanguage(req);
    const userId = req.user!.id;

    const { revokedCount } = await this.logoutAllUseCase.execute(
      userId,
      {
        ip: this.resolveClientIp(req),
        country: this.getHeader(req, 'x-country'),
      },
    );

    this.clearAuthCookies(res);

    return successResponse(
      { revokedCount },
      {
        message: this.i18n.translate('auth.logout_all_success', lang),
      },
    );
  }

  /**
   * Cambio de contraseña del usuario autenticado
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ChangePasswordSwagger()
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const lang = this.resolveLanguage(req);
    const userId = req.user!.id;

    await this.changePasswordUseCase.execute(
      userId,
      dto.currentPassword,
      dto.newPassword,
      {
        ip: this.resolveClientIp(req),
        country: this.getHeader(req, 'x-country'),
      },
    );

    return successResponse(
      {},
      {
        message: this.i18n.translate('auth.change_password_success', lang),
      },
    );
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @Enable2faSwagger()
  async enable2fa(
    @Body() dto: Enable2faDto,
    @Req() req: Request,
  ) {
    const userId = req.user!.id;

    const setup = await this.enable2faUseCase.execute(
      userId,
      dto.password,
      {
        ip: this.resolveClientIp(req),
        country: this.getHeader(req, 'x-country'),
      },
    );

    return successResponse(
      {
        secret: setup.secret,
        otpauthUrl: setup.otpauthUrl,
        qrCode: setup.qrCode,
      },
      {
        message: this.i18n.translate('auth.2fa_enable_success', this.resolveLanguage(req)),
      },
    );
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  @Verify2faSwagger()
  async verify2fa(
    @Body() dto: Verify2faDto,
    @Req() req: Request,
  ) {
    const userId = req.user!.id;

    const result = await this.verify2faUseCase.execute(
      userId,
      dto.totpCode,
      {
        ip: this.resolveClientIp(req),
        country: this.getHeader(req, 'x-country'),
      },
    );

    return successResponse(
      { recoveryCodes: result.recoveryCodes },
      {
        message: this.i18n.translate('auth.2fa_verify_success', this.resolveLanguage(req)),
      },
    );
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @Disable2faSwagger()
  async disable2fa(
    @Body() dto: Disable2faDto,
    @Req() req: Request,
  ) {
    const userId = req.user!.id;

    await this.disable2faUseCase.execute(
      userId,
      dto.password,
      dto.totpCode,
      {
        ip: this.resolveClientIp(req),
        country: this.getHeader(req, 'x-country'),
      },
    );

    return successResponse(
      {},
      {
        message: this.i18n.translate('auth.2fa_disable_success', this.resolveLanguage(req)),
      },
    );
  }

  @Get('trusted-countries')
  @UseGuards(JwtAuthGuard)
  @GetTrustedCountriesSwagger()
  async getTrustedCountries(@Req() req: Request) {
    const { countries } = await this.getTrustedCountriesUseCase.execute(req.user!.id);
    return successResponse({ countries });
  }

  @Post('trusted-countries')
  @UseGuards(JwtAuthGuard)
  @AddTrustedCountrySwagger()
  async addTrustedCountry(
    @Body() dto: AddTrustedCountryDto,
    @Req() req: Request,
  ) {
    await this.addTrustedCountryUseCase.execute(req.user!.id, dto.country);
    return successResponse(
      {},
      { message: this.i18n.translate('auth.trusted_country_added', this.resolveLanguage(req)) },
    );
  }

  @Delete('trusted-countries/:country')
  @UseGuards(JwtAuthGuard)
  @RemoveTrustedCountrySwagger()
  async removeTrustedCountry(
    @Param('country') country: string,
    @Req() req: Request,
  ) {
    await this.removeTrustedCountryUseCase.execute(req.user!.id, country);
    return successResponse(
      {},
      { message: this.i18n.translate('auth.trusted_country_removed', this.resolveLanguage(req)) },
    );
  }

  /**
   * Resuelve idioma desde Accept-Language
   */
  private resolveLanguage(req: Request): 'es' | 'en' {
    return this.i18n.resolveLanguage(
      req.get('accept-language'),
    ) as 'es' | 'en';
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

  /**
   * Limpia las cookies de autenticación del cliente.
   *
   * @remarks
   * Invalida `accessToken` y `refreshToken` del lado del browser
   * sobreescribiéndolas con `maxAge: 0`.
   *
   * @param res - Objeto de respuesta de Express
   */
  private clearAuthCookies(res: Response): void {
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0,
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
  }
}
