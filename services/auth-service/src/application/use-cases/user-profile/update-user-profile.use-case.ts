import { Inject } from '@nestjs/common';
import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';
import { UserProfileRepository } from '@domain/repositories/user-profile.repository';
import { USER_PROFILE_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { DocumentType } from '@domain/enums/document-type.enum';

/**
 * Caso de uso: actualiza (parcialmente) el perfil del usuario.
 *
 * @remarks
 * Usado tanto para editar nombre/apellido como para completar
 * progresivamente `phone`/`documentType`/`documentNumber` antes de la
 * primera acción que los requiera.
 */
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async execute(
    userId: string,
    changes: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      documentType?: DocumentType;
      documentNumber?: string;
    },
  ): Promise<UserProfile> {
    const existing = await this.userProfileRepository.findByUserId(userId);

    if (!existing) {
      throw DomainErrorFactory.userProfileNotFound();
    }

    const updated = existing.updateContactInfo(changes);

    await this.userProfileRepository.update(updated);

    return updated;
  }
}
