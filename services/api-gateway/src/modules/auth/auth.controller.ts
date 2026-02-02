import { Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import { AuthProxy } from '@/infrastructure/http/auth.proxy';
import { successResponse } from '@saas/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authProxy: AuthProxy) { }

  @Post('login')
  async login(@Req() req: Request) {
    const data = await this.authProxy.forward(req, '/auth/login');
    return successResponse(data);
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const data = await this.authProxy.forward(req, '/auth/refresh');
    return successResponse(data);
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    const data = await this.authProxy.forward(req, '/auth/logout');
    return successResponse(data);
  }
}
