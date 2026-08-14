import { randomUUID } from 'node:crypto';

import { Controller, Get, Patch, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AuthProxy } from '@infrastructure/http/proxies/auth.proxy';
import {
  CreateUserProfileGatewaySwagger,
  GetUserProfileGatewaySwagger,
  UpdateUserProfileGatewaySwagger,
  UploadProfileImageGatewaySwagger,
} from '@infrastructure/swagger/user-profile.swagger';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Controller de Perfil de Usuario en el API Gateway.
 *
 * @remarks
 * Deliberadamente separado de `AuthController`: mismo backend
 * (auth-service, vía `AuthProxy`), pero un contrato público distinto —
 * no toca credenciales/sesión, solo datos de exhibición/contacto.
 */
@ApiTags('User Profile')
@Controller('users/me/profile')
export class UserController {
  constructor(private readonly authProxy: AuthProxy) {}

  @CreateUserProfileGatewaySwagger()
  @Post()
  async create(@Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, '/users/me/profile');
    return body;
  }

  @GetUserProfileGatewaySwagger()
  @Get()
  async get(@Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, '/users/me/profile');
    return body;
  }

  @UpdateUserProfileGatewaySwagger()
  @Patch()
  async update(@Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forward(req, '/users/me/profile');
    return body;
  }

  @UploadProfileImageGatewaySwagger()
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    this.prepareRequest(req);
    const { body } = await this.authProxy.forwardMultipart(req, '/users/me/profile/avatar', {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });
    return body;
  }

  /**
   * Prepara headers comunes antes de reenviar la request.
   */
  private prepareRequest(req: Request): void {
    req.headers['x-correlation-id'] ??= randomUUID();
    req.headers['accept-language'] ??= 'es';
  }
}
