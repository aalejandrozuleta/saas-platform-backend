import { randomUUID } from 'node:crypto';

import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PublicRoute } from '@saas/shared';
import { ApiTags } from '@nestjs/swagger';
import { AuthProxy } from '@infrastructure/http/proxies/auth.proxy';
import {
  RegisterGatewaySwagger,
  LoginGatewaySwagger,
  RefreshGatewaySwagger,
  LogoutGatewaySwagger,
  LogoutAllGatewaySwagger,
  ChangePasswordGatewaySwagger,
  Enable2faGatewaySwagger,
  Verify2faGatewaySwagger,
  Disable2faGatewaySwagger,
  GetSessionsGatewaySwagger,
  RevokeSessionGatewaySwagger,
  GetTrustedCountriesGatewaySwagger,
  AddTrustedCountryGatewaySwagger,
  RemoveTrustedCountryGatewaySwagger,
} from '@infrastructure/swagger/auth.swagger';

/**
 * Controller de Auth en el API Gateway
 *
 * Responsabilidades:
 * - Exponer contrato público
 * - Versionar endpoints
 * - Reenviar requests al auth-service
 * - Normalizar respuestas
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authProxy: AuthProxy) { }

  @RegisterGatewaySwagger()
  @PublicRoute()
  @Post('register')
  async register(@Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, '/register');

    return body;
  }

  @LoginGatewaySwagger()
  @PublicRoute()
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {

    this.prepareRequest(req);

    const result = await this.authProxy.forward(req, '/login');

    if (result.cookies) {
      res.setHeader('set-cookie', result.cookies);
    }

    return result.body;
  }

  @RefreshGatewaySwagger()
  @PublicRoute()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.prepareRequest(req);

    const result = await this.authProxy.forward(req, '/refresh');

    if (result.cookies) {
      res.setHeader('set-cookie', result.cookies);
    }

    return result.body;
  }

  @ChangePasswordGatewaySwagger()
  @Post('change-password')
  async changePassword(@Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, '/change-password');
    return body;
  }

  @LogoutGatewaySwagger()
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.prepareRequest(req);
    const result = await this.authProxy.forward(req, '/logout');

    if (result.cookies) {
      res.setHeader('set-cookie', result.cookies);
    }

    return result.body;
  }

  @LogoutAllGatewaySwagger()
  @Post('logout-all')
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.prepareRequest(req);
    const result = await this.authProxy.forward(req, '/logout-all');

    if (result.cookies) {
      res.setHeader('set-cookie', result.cookies);
    }

    return result.body;
  }

  @Enable2faGatewaySwagger()
  @Post('2fa/enable')
  async enable2fa(@Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, '/2fa/enable');
    return body;
  }

  @Verify2faGatewaySwagger()
  @Post('2fa/verify')
  async verify2fa(@Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, '/2fa/verify');
    return body;
  }

  @Disable2faGatewaySwagger()
  @Post('2fa/disable')
  async disable2fa(@Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, '/2fa/disable');
    return body;
  }

  @GetSessionsGatewaySwagger()
  @Get('sessions')
  async getSessions(@Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, '/sessions');
    return body;
  }

  @RevokeSessionGatewaySwagger()
  @Delete('sessions/:sessionId')
  async revokeSession(@Req() req: Request, @Param('sessionId') sessionId: string) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, `/sessions/${sessionId}`);
    return body;
  }

  @GetTrustedCountriesGatewaySwagger()
  @Get('trusted-countries')
  async getTrustedCountries(@Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, '/trusted-countries');
    return body;
  }

  @AddTrustedCountryGatewaySwagger()
  @Post('trusted-countries')
  async addTrustedCountry(@Req() req: Request) {
    this.prepareRequest(req);

    const response = await this.authProxy.forward(req, '/trusted-countries');
    return response.body;
  }

  @RemoveTrustedCountryGatewaySwagger()
  @Delete('trusted-countries/:country')
  async removeTrustedCountry(@Req() req: Request, @Param('country') country: string) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, `/trusted-countries/${country}`);
    return body;
  }

  /**
   * Prepara headers comunes antes de reenviar la request
   * @param req Request entrante
   */
  private prepareRequest(req: Request): void {
    // Correlation ID para tracing distribuido
    req.headers['x-correlation-id'] ??= randomUUID();

    // Idioma por defecto
    req.headers['accept-language'] ??= 'es';
  }
}
