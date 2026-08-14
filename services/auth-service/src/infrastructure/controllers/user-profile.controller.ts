import { memoryStorage } from 'multer';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { I18nService, successResponse } from '@saas/shared';
import { Request } from 'express';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';
import { CreateUserProfileUseCase } from '@application/use-cases/user-profile/create-user-profile.use-case';
import { GetUserProfileUseCase } from '@application/use-cases/user-profile/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '@application/use-cases/user-profile/update-user-profile.use-case';
import { UploadProfileImageUseCase } from '@application/use-cases/user-profile/upload-profile-image.use-case';
import { CreateUserProfileDto } from '@application/dto/user-profile/create-user-profile.dto';
import { UpdateUserProfileDto } from '@application/dto/user-profile/update-user-profile.dto';
import { type UserProfile } from '@domain/entities/user-profile/user-profile.entity';
import {
  CreateUserProfileSwagger,
  GetUserProfileSwagger,
  UpdateUserProfileSwagger,
  UploadProfileImageSwagger,
} from '@infrastructure/swagger/user-profile.swagger';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Controller del perfil del usuario ("paso 2" del registro en adelante).
 *
 * @remarks
 * Deliberadamente separado de `AuthController`: este controller no toca
 * credenciales/sesión, solo datos de exhibición/contacto (`UserProfile`).
 * Ver `modules/user/user.module.ts`.
 */
@ApiTags('User Profile')
@Controller({ path: 'users/me/profile', version: '1' })
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  constructor(
    private readonly createUserProfileUseCase: CreateUserProfileUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly uploadProfileImageUseCase: UploadProfileImageUseCase,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @CreateUserProfileSwagger()
  async create(@Body() dto: CreateUserProfileDto, @Req() req: Request) {
    const profile = await this.createUserProfileUseCase.execute(req.user!.id, dto);

    return successResponse(this.toResponse(profile), {
      message: this.i18n.translate('user_profile.created_success', this.resolveLanguage(req)),
    });
  }

  @Get()
  @GetUserProfileSwagger()
  async get(@Req() req: Request) {
    const profile = await this.getUserProfileUseCase.execute(req.user!.id);

    return successResponse(this.toResponse(profile));
  }

  @Patch()
  @UpdateUserProfileSwagger()
  async update(@Body() dto: UpdateUserProfileDto, @Req() req: Request) {
    const profile = await this.updateUserProfileUseCase.execute(req.user!.id, dto);

    return successResponse(this.toResponse(profile), {
      message: this.i18n.translate('user_profile.updated_success', this.resolveLanguage(req)),
    });
  }

  @Post('avatar')
  @UploadProfileImageSwagger()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const profile = await this.uploadProfileImageUseCase.execute(req.user!.id, {
      buffer: file.buffer,
    });

    return successResponse(this.toResponse(profile), {
      message: this.i18n.translate(
        'user_profile.avatar_updated_success',
        this.resolveLanguage(req),
      ),
    });
  }

  private toResponse(profile: UserProfile) {
    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
      documentType: profile.documentType,
      documentNumber: profile.documentNumber,
      avatarUrl: profile.avatarUrl,
      isCompleteForTransactions: profile.isCompleteForTransactions(),
    };
  }

  private resolveLanguage(req: Request): 'es' | 'en' {
    return this.i18n.resolveLanguage(req.get('accept-language')) as 'es' | 'en';
  }
}
