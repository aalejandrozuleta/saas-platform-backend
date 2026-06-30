import { Inject } from '@nestjs/common';
import { PLATFORM_LOGGER, PlatformLogger } from '@saas/shared';
import { UserRepository } from '@domain/repositories/user.repository';
import { USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

export class VerifyEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(PLATFORM_LOGGER)
    private readonly logger: PlatformLogger,
  ) {}

  async execute(token: string): Promise<void> {
    const user = await this.userRepository.findByVerificationToken(token);

    if (!user) {
      throw DomainErrorFactory.invalidVerificationToken();
    }

    if (user.isEmailVerificationTokenExpired(new Date())) {
      throw DomainErrorFactory.invalidVerificationToken();
    }

    const verified = user.verifyEmail();
    await this.userRepository.update(verified);

    this.logger.info('Email verificado correctamente', { userId: user.id });
  }
}
