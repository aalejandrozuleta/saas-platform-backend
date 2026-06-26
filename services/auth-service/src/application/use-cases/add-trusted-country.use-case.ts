import { Inject } from '@nestjs/common';
import { SECURITY_REPOSITORY } from '@domain/token/repositories.tokens';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

const MAX_TRUSTED_COUNTRIES = 2;

export class AddTrustedCountryUseCase {
  constructor(
    @Inject(SECURITY_REPOSITORY)
    private readonly securityRepository: SecurityRepository,
  ) {}

  async execute(userId: string, country: string): Promise<void> {
    const current = await this.securityRepository.getTrustedCountries(userId);

    if (current.includes(country)) {
      throw DomainErrorFactory.trustedCountryAlreadyExists();
    }

    if (current.length >= MAX_TRUSTED_COUNTRIES) {
      throw DomainErrorFactory.trustedCountryLimitReached();
    }

    await this.securityRepository.addTrustedCountry(userId, country);
  }
}
