import { Inject } from '@nestjs/common';
import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';
import { UserProfileRepository } from '@domain/repositories/user-profile.repository';
import { USER_PROFILE_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: crea el perfil del usuario ("paso 2" del registro).
 *
 * @remarks
 * El registro (paso 1, `RegisterUserUseCase`) solo crea el `User` con
 * email/password. Este caso de uso es el que crea la información de
 * exhibición/contacto (`UserProfile`) — se llama una sola vez, ya
 * autenticado el usuario.
 */
export class CreateUserProfileUseCase {
  constructor(
    @Inject(USER_PROFILE_REPOSITORY)
    private readonly userProfileRepository: UserProfileRepository,
  ) {}

  async execute(
    userId: string,
    input: {
      firstName: string;
      lastName: string;
      dataProcessingAccepted: boolean;
      termsAccepted: boolean;
    },
  ): Promise<UserProfile> {
    const existing = await this.userProfileRepository.findByUserId(userId);

    if (existing) {
      throw DomainErrorFactory.userProfileAlreadyExists();
    }

    const now = new Date();

    const profile = UserProfile.create({
      userId,
      firstName: input.firstName,
      lastName: input.lastName,
      dataProcessingAcceptedAt: now,
      termsAcceptedAt: now,
    });

    await this.userProfileRepository.save(profile);

    return profile;
  }
}
