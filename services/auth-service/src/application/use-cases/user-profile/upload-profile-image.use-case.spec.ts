import { ErrorCode } from '@saas/shared';
import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';

import { UploadProfileImageUseCase } from './upload-profile-image.use-case';

describe('UploadProfileImageUseCase', () => {
  let useCase: UploadProfileImageUseCase;
  let userProfileRepository: any;
  let imageStorage: any;
  let imageProcessor: any;

  const existingProfile = UserProfile.create({
    userId: 'user-1',
    firstName: 'Juan',
    lastName: 'Pérez',
    dataProcessingAcceptedAt: new Date('2026-01-01'),
    termsAcceptedAt: new Date('2026-01-01'),
  });

  const sanitizedImage = {
    buffer: Buffer.from('sanitized'),
    contentType: 'image/webp',
    extension: 'webp',
  };

  beforeEach(() => {
    userProfileRepository = {
      findByUserId: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };

    imageStorage = {
      upload: jest.fn().mockResolvedValue('https://storage.example.com/avatars/user-1.webp'),
    };

    imageProcessor = {
      sanitize: jest.fn().mockResolvedValue(sanitizedImage),
    };

    useCase = new UploadProfileImageUseCase(userProfileRepository, imageStorage, imageProcessor);
  });

  it('debe sanear la imagen, subirla y actualizar avatarUrl', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(existingProfile);

    const updated = await useCase.execute('user-1', { buffer: Buffer.from('raw-upload') });

    expect(imageProcessor.sanitize).toHaveBeenCalledWith(Buffer.from('raw-upload'));
    expect(imageStorage.upload).toHaveBeenCalledWith(
      'avatars/user-1.webp',
      sanitizedImage.buffer,
      'image/webp',
    );
    expect(updated.avatarUrl).toBe('https://storage.example.com/avatars/user-1.webp');
    expect(userProfileRepository.update).toHaveBeenCalled();
  });

  it('debe lanzar VALIDATION_ERROR si el archivo no decodifica como una imagen soportada', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(existingProfile);
    imageProcessor.sanitize.mockRejectedValue(new Error('UNSUPPORTED_IMAGE_FORMAT:undecodable'));

    await expect(
      useCase.execute('user-1', { buffer: Buffer.from('not-an-image') }),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_ERROR });

    expect(imageStorage.upload).not.toHaveBeenCalled();
    expect(userProfileRepository.update).not.toHaveBeenCalled();
  });

  it('debe lanzar USER_PROFILE_NOT_FOUND si el perfil no existe, sin sanear la imagen', async () => {
    userProfileRepository.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', { buffer: Buffer.from('raw-upload') }),
    ).rejects.toMatchObject({ code: ErrorCode.USER_PROFILE_NOT_FOUND });

    expect(imageProcessor.sanitize).not.toHaveBeenCalled();
    expect(imageStorage.upload).not.toHaveBeenCalled();
  });
});
