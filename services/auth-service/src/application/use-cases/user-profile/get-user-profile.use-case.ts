import { Inject } from '@nestjs/common';
import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';
import { UserProfileRepository } from '@domain/repositories/user-profile.repository';
import { USER_PROFILE_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: obtiene el perfil del usuario autenticado.
 */
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async execute(userId: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findByUserId(userId);

    if (!profile) {
      throw DomainErrorFactory.userProfileNotFound();
    }

    return profile;
  }
}
