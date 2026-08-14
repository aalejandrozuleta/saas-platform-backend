import { Inject } from '@nestjs/common';
import { SECURITY_REPOSITORY } from '@domain/token/repositories.tokens';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: eliminar un país de la lista de confianza del usuario.
 *
 * @remarks
 * Al remover un país de confianza, futuros intentos de login desde ese
 * país volverán a evaluarse como riesgo (ver `LoginSecurityChallengeService`)
 * y podrán requerir un challenge de verificación adicional.
 */
export class RemoveTrustedCountryUseCase {
  constructor(
    @Inject(SECURITY_REPOSITORY)
    private readonly securityRepository: SecurityRepository,
  ) {}

  /**
   * Ejecuta la eliminación del país de confianza.
   *
   * @param userId - Identificador del usuario autenticado
   * @param country - Código de país a remover de la lista de confianza
   * @throws Error de dominio si el país no está registrado como confiable
   */
  async execute(userId: string, country: string): Promise<void> {
    const current = await this.securityRepository.getTrustedCountries(userId);

    if (!current.includes(country)) {
      throw DomainErrorFactory.trustedCountryNotFound();
    }

    await this.securityRepository.removeTrustedCountry(userId, country);
  }
}
