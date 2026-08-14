import { Inject } from '@nestjs/common';
import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';
import { UserProfileRepository } from '@domain/repositories/user-profile.repository';
import { USER_PROFILE_REPOSITORY } from '@domain/token/repositories.tokens';
import { IMAGE_STORAGE, IMAGE_PROCESSOR } from '@domain/token/services.tokens';
import { type ImageStoragePort } from '@application/ports/image-storage.port';
import { type ImageProcessorPort } from '@application/ports/image-processor.port';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { DomainException } from '@domain/errors/domain.exception';
import { ErrorCode } from '@saas/shared';

/**
 * Caso de uso: sube la foto de perfil y actualiza `avatarUrl`.
 *
 * @remarks
 * No confía en el `mimetype` que declara el cliente (viene del header
 * `Content-Type`, trivial de falsificar): el archivo se decodifica y
 * re-codifica de verdad vía {@link ImageProcessorPort} antes de subirlo,
 * lo que garantiza que solo se almacenan imágenes rasterizadas válidas.
 */
export class UploadProfileImageUseCase {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository,

    @Inject(IMAGE_STORAGE)
    private readonly imageStorage: ImageStoragePort,

    @Inject(IMAGE_PROCESSOR)
    private readonly imageProcessor: ImageProcessorPort,
  ) {}

  async execute(userId: string, file: { buffer: Buffer }): Promise<UserProfile> {
    const existing = await this.userProfileRepository.findByUserId(userId);

    if (!existing) {
      throw DomainErrorFactory.userProfileNotFound();
    }

    const sanitized = await this.sanitizeOrThrow(file.buffer);

    const key = `avatars/${userId}.${sanitized.extension}`;

    const avatarUrl = await this.imageStorage.upload(key, sanitized.buffer, sanitized.contentType);

    const updated = existing.updateAvatar(avatarUrl);

    await this.userProfileRepository.update(updated);

    return updated;
  }

  private async sanitizeOrThrow(buffer: Buffer) {
    try {
      return await this.imageProcessor.sanitize(buffer);
    } catch {
      throw DomainException.create(
        'user_profile.invalid_avatar_type',
        ErrorCode.VALIDATION_ERROR,
        400,
      );
    }
  }
}
