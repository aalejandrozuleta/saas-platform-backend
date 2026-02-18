import { UserBlockedError } from '@domain/errors/user-blocked.error';
import { DeviceNotTrustedError } from '@domain/errors/device-not-trusted.error';
import { InvalidCredentialsError } from '@domain/errors/invalid-credentials.error';
import { UserStatus } from '@domain/enums/user-status.enum';

/**
 * Política de negocio para autenticación.
 *
 * Contiene exclusivamente reglas puras de dominio.
 * No accede a infraestructura ni repositorios.
 */
export class LoginPolicy {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 15;

  /**
   * Valida que el usuario esté en estado válido para autenticación.
   *
   * @param status - Estado actual del usuario
   * @throws InvalidCredentialsError si el usuario no está activo
   */
  validateUserStatus(status: UserStatus): void {
    if (status !== UserStatus.ACTIVE) {
      throw new InvalidCredentialsError();
    }
  }

  /**
   * Valida si la cuenta está actualmente bloqueada.
   *
   * @param failedAttempts - Número de intentos fallidos actuales
   * @param blockedUntil - Fecha hasta la cual la cuenta está bloqueada
   * @throws UserBlockedError si la cuenta está bloqueada
   */
  validateAttempts(
    failedAttempts: number,
    blockedUntil?: Date,
  ): void {
    if (blockedUntil && blockedUntil > new Date()) {
      throw new UserBlockedError(blockedUntil);
    }

    if (failedAttempts >= this.MAX_ATTEMPTS) {
      throw new UserBlockedError();
    }
  }

  /**
   * Determina si la cuenta debe bloquearse.
   *
   * @param failedAttempts - Número de intentos fallidos acumulados
   * @returns true si debe bloquearse
   */
  shouldLockAccount(failedAttempts: number): boolean {
    return failedAttempts >= this.MAX_ATTEMPTS;
  }

  /**
   * Duración del bloqueo en minutos.
   *
   * @returns minutos de bloqueo
   */
  lockDuration(): number {
    return this.LOCK_DURATION_MINUTES;
  }

  /**
   * Valida si el dispositivo es confiable.
   *
   * @param isTrusted - Indicador de confianza del dispositivo
   * @throws DeviceNotTrustedError si el dispositivo no es confiable
   */
  validateDevice(isTrusted: boolean): void {
    if (!isTrusted) {
      throw new DeviceNotTrustedError();
    }
  }

  /**
   * Valida si el país actual está dentro de los países confiables.
   *
   * @param trustedCountries - Lista de países confiables del usuario
   * @param country - País actual detectado
   * @throws DeviceNotTrustedError si el país no es confiable
   */
  validateCountry(
    trustedCountries: string[] | undefined,
    country?: string,
  ): void {
    if (!trustedCountries?.length || !country) return;

    if (!trustedCountries.includes(country)) {
      throw new DeviceNotTrustedError({
        country,
        reason: 'COUNTRY_NOT_TRUSTED',
      });
    }
  }

  /**
   * Valida que el contexto tenga fingerprint válido.
   *
   * @param fingerprint - Identificador del dispositivo
   * @throws Error si es inválido
   */
  validateDeviceFingerprint(fingerprint?: string): void {
    if (!fingerprint) {
      throw new Error('DEVICE_FINGERPRINT_REQUIRED');
    }
  }
}
