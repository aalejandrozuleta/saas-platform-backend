import { Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';

import { AuthProxy } from '../../infrastructure/http/auth.proxy';

/**
 * Controlador público de Auth en el Gateway.
 * Solo reenvía requests al auth-service.
 */
@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    await AuthProxy.forward(req, res, '/auth/login');
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    await AuthProxy.forward(req, res, '/auth/refresh');
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    await AuthProxy.forward(req, res, '/auth/logout');
  }
}
