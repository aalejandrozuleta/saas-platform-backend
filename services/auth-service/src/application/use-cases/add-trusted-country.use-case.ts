import { Inject } from '@nestjs/common';
import { SECURITY_REPOSITORY } from '@domain/token/repositories.tokens';
import { SecurityRepository } from '@domain/repositories/security.repository';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

const MAX_TRUSTED_COUNTRIES = 2;

/**
 * Caso de uso: registrar un país como confiable para el usuario.
 *
 * @remarks
 * Los países de confianza se usan como señal en la evaluación de riesgo de
 * login (ver `LoginSecurityChallengeService`): un intento de acceso desde un
 * país no confiable puede disparar un challenge de verificación adicional.
 *
 * Reglas de negocio:
 *  - No se permiten países duplicados.
 *  - El usuario solo puede tener hasta `MAX_TRUSTED_COUNTRIES` (2) países
 *    de confianza simultáneamente, para limitar la superficie de ataque
 *    si la cuenta es comprometida.
 */
export class AddTrustedCountryUseCase {
  constructor(
    @Inject(SECURITY_REPOSITORY)
    private readonly securityRepository: SecurityRepository,
  ) {}

  /**
   * Ejecuta el alta del país de confianza.
   *
   * @param userId - Identificador del usuario autenticado
   * @param country - Código de país a marcar como confiable
   * @throws Error de dominio si el país ya está registrado o si se alcanzó
   * el límite máximo de países de confianza
   */
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
