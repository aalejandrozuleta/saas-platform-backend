import { Inject } from '@nestjs/common';
import { SECURITY_REPOSITORY } from '@domain/token/repositories.tokens';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

export class RemoveTrustedCountryUseCase {
  constructor(
    @Inject(SECURITY_REPOSITORY)
    private readonly securityRepository: SecurityRepository,
  ) {}

  async execute(userId: string, country: string): Promise<void> {
    const current = await this.securityRepository.getTrustedCountries(userId);

    if (!current.includes(country)) {
      throw DomainErrorFactory.trustedCountryNotFound();
    }

    await this.securityRepository.removeTrustedCountry(userId, country);
  }
}
