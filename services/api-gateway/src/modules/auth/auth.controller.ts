import { randomUUID } from 'node:crypto';

import {
  Controller,
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
    req.headers['x-user-id'] = req.user!.id;

    const { body } = await this.authProxy.forward(req, '/change-password');
    return body;
  }

  /**
   * Inyecta `x-user-id` y `x-session-id` como headers internos
   * para que el auth-service identifique la sesión a revocar.
   */
  @LogoutGatewaySwagger()
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.prepareRequest(req);
    req.headers['x-user-id'] = req.user!.id;
    req.headers['x-session-id'] = req.user!.sessionId;

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
    req.headers['x-user-id'] = req.user!.id;

    const result = await this.authProxy.forward(req, '/logout-all');

    if (result.cookies) {
      res.setHeader('set-cookie', result.cookies);
    }

    return result.body;
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
