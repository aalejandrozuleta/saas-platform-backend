import { Inject } from '@nestjs/common';
import { SECURITY_REPOSITORY } from '@domain/token/repositories.tokens';
import { SecurityRepository } from '@domain/repositories/security.repository';

export class GetTrustedCountriesUseCase {
  constructor(
    @Inject(SECURITY_REPOSITORY)
    private readonly securityRepository: SecurityRepository,
  ) {}

  async execute(userId: string): Promise<{ countries: string[] }> {
    const countries = await this.securityRepository.getTrustedCountries(userId);
    return { countries };
  }
}
