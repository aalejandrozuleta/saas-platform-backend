import { randomUUID } from 'node:crypto';

import {
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { successResponse } from '@saas/shared';
import { AuthProxy } from '@infrastructure/http/auth.proxy';

/**
 * Controller de Auth en el API Gateway
 *
 * Responsabilidades:
 * - Exponer contrato público
 * - Versionar endpoints
 * - Reenviar requests al auth-service
 * - Normalizar respuestas
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authProxy: AuthProxy) {}

  /**
   * Registro de usuario
   */
  @Post('register')
  async register(@Req() req: Request) {
    this.prepareRequest(req);
    const data = await this.authProxy.forward(req, '/register');    
    return successResponse(data);
  }

  /**
   * Login de usuario
   */
  @Post('login')
  async login(@Req() req: Request) {
    this.prepareRequest(req);
    try {
      const data = await this.authProxy.forward(req, '/login');
      console.log('data',data);
      
      return successResponse(data);
    } catch (error) {
      console.log('error', error);
      
      throw error;
    }
  }

  /**
   * Refresh de sesión
   */
  @Post('refresh')
  async refresh(@Req() req: Request) {
    this.prepareRequest(req);

    const data = await this.authProxy.forward(req, '/refresh');
    return successResponse(data);
  }

  /**
   * Logout de usuario
   */
  @Post('logout')
  async logout(@Req() req: Request) {
    this.prepareRequest(req);

    const data = await this.authProxy.forward(req, '/logout');
    return successResponse(data);
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
