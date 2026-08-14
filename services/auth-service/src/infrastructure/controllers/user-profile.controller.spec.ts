import { Test, type TestingModule } from '@nestjs/testing';
import { CreateUserProfileUseCase } from '@application/use-cases/user-profile/create-user-profile.use-case';
import { GetUserProfileUseCase } from '@application/use-cases/user-profile/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '@application/use-cases/user-profile/update-user-profile.use-case';
import { UploadProfileImageUseCase } from '@application/use-cases/user-profile/upload-profile-image.use-case';
import { I18nService } from '@saas/shared';
import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';
import { JwtAuthGuard } from '@infrastructure/security/jwt-auth.guard';

import { UserProfileController } from './user-profile.controller';

describe('UserProfileController', () => {
  let controller: UserProfileController;
  let createUserProfileUseCase: jest.Mocked<CreateUserProfileUseCase>;
  let getUserProfileUseCase: jest.Mocked<GetUserProfileUseCase>;
  let updateUserProfileUseCase: jest.Mocked<UpdateUserProfileUseCase>;
  let uploadProfileImageUseCase: jest.Mocked<UploadProfileImageUseCase>;
  let i18n: jest.Mocked<I18nService>;

  const profile = UserProfile.create({
    userId: 'user-1',
    firstName: 'Juan',
    lastName: 'Pérez',
    dataProcessingAcceptedAt: new Date('2026-01-01'),
    termsAcceptedAt: new Date('2026-01-01'),
  });

  const req: any = {
    user: { id: 'user-1', sessionId: 'session-1', role: 'CUSTOMER' },
    headers: { 'accept-language': 'es' },
    get: (key: string) => req.headers[key],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProfileController],
      providers: [
        { provide: CreateUserProfileUseCase, useValue: { execute: jest.fn() } },
        { provide: GetUserProfileUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateUserProfileUseCase, useValue: { execute: jest.fn() } },
        { provide: UploadProfileImageUseCase, useValue: { execute: jest.fn() } },
        {
          provide: I18nService,
          useValue: {
            translate: jest.fn((key: string) => key),
            resolveLanguage: jest.fn((lang?: string) => (lang?.startsWith('es') ? 'es' : 'en')),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UserProfileController);
    createUserProfileUseCase = module.get(CreateUserProfileUseCase);
    getUserProfileUseCase = module.get(GetUserProfileUseCase);
    updateUserProfileUseCase = module.get(UpdateUserProfileUseCase);
    uploadProfileImageUseCase = module.get(UploadProfileImageUseCase);
    i18n = module.get(I18nService);
  });

  it('debe crear el perfil', async () => {
    createUserProfileUseCase.execute.mockResolvedValue(profile);
    i18n.translate.mockReturnValue('Perfil creado correctamente');

    const result = await controller.create(
      { firstName: 'Juan', lastName: 'Pérez', dataProcessingAccepted: true, termsAccepted: true },
      req,
    );

    expect(createUserProfileUseCase.execute).toHaveBeenCalledWith('user-1', {
      firstName: 'Juan',
      lastName: 'Pérez',
      dataProcessingAccepted: true,
      termsAccepted: true,
    });
    expect(result).toEqual({
      success: true,
      message: 'Perfil creado correctamente',
      data: {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: undefined,
        documentType: undefined,
        documentNumber: undefined,
        avatarUrl: undefined,
        isCompleteForTransactions: false,
      },
    });
  });

  it('debe obtener el perfil', async () => {
    getUserProfileUseCase.execute.mockResolvedValue(profile);

    const result = await controller.get(req);

    expect(getUserProfileUseCase.execute).toHaveBeenCalledWith('user-1');
    expect(result.data.firstName).toBe('Juan');
  });

  it('debe actualizar el perfil', async () => {
    updateUserProfileUseCase.execute.mockResolvedValue(profile);
    i18n.translate.mockReturnValue('Perfil actualizado correctamente');

    const result = await controller.update({ phone: '3001234567' }, req);

    expect(updateUserProfileUseCase.execute).toHaveBeenCalledWith('user-1', {
      phone: '3001234567',
    });
    expect(result.message).toBe('Perfil actualizado correctamente');
  });

  it('debe subir la foto de perfil', async () => {
    uploadProfileImageUseCase.execute.mockResolvedValue(profile);
    i18n.translate.mockReturnValue('Foto de perfil actualizada correctamente');

    const file: any = { buffer: Buffer.from('img'), mimetype: 'image/png' };

    const result = await controller.uploadAvatar(file, req);

    expect(uploadProfileImageUseCase.execute).toHaveBeenCalledWith('user-1', {
      buffer: file.buffer,
    });
    expect(result.message).toBe('Foto de perfil actualizada correctamente');
  });
});
