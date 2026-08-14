import { Inject } from '@nestjs/common';
import { SECURITY_REPOSITORY } from '@domain/token/repositories.tokens';
import { SecurityRepository } from '@domain/repositories/security.repository';

/**
 * Caso de uso: obtener los países marcados como confiables por el usuario.
 *
 * @remarks
 * Permite al usuario ver qué países configuró como confiables (ver
 * `AddTrustedCountryUseCase`), típicamente para gestionarlos desde su
 * panel de seguridad.
 */
export class GetTrustedCountriesUseCase {
  constructor(
    @Inject(SECURITY_REPOSITORY)
    private readonly securityRepository: SecurityRepository,
  ) {}

  /**
   * Ejecuta la consulta de países de confianza.
   *
   * @param userId - Identificador del usuario autenticado
   * @returns Objeto con la lista de códigos de país confiables
   */
  async execute(userId: string): Promise<{ countries: string[] }> {
    const countries = await this.securityRepository.getTrustedCountries(userId);
    return { countries };
  }
}
