import { UserStatus } from '@domain/enums/user-status.enum';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Política de autenticación.
 * Contiene exclusivamente reglas puras de dominio.
 */
export class LoginPolicy {
  constructor(
    private readonly maxAttempts: number = 3,
    private readonly lockDurationMinutes: number = 15,
  ) {}

  /**
   * Valida que el usuario esté activo.
   */
  validateUserStatus(status: UserStatus): void {
    if (status !== UserStatus.ACTIVE) {
      throw DomainErrorFactory.invalidCredentials();
    }
  }

  /**
   * Valida intentos fallidos y bloqueo temporal.
   */
  validateAttempts(
    failedAttempts: number,
    blockedUntil: Date | undefined,
    now: Date,
  ): void {
    if (blockedUntil && blockedUntil > now) {
      throw DomainErrorFactory.userBlocked(blockedUntil);
    }

    if (failedAttempts >= this.maxAttempts) {
      throw DomainErrorFactory.userBlocked();
    }
  }

  /**
   * Determina si la cuenta debe bloquearse.
   */
  shouldLockAccount(failedAttempts: number): boolean {
    return failedAttempts >= this.maxAttempts;
  }

  /**
   * Duración del bloqueo en minutos.
   */
  lockDuration(): number {
    return this.lockDurationMinutes;
  }

  /**
   * Máximo número de intentos permitidos.
   */
  getMaxAttempts(): number {
    return this.maxAttempts;
  }

  /**
   * Valida si el dispositivo es confiable.
   */
  validateDevice(isTrusted: boolean): void {
    if (!isTrusted) {
      throw DomainErrorFactory.deviceNotTrusted();
    }
  }

  /**
   * Valida si el país es confiable.
   */
  validateCountry(
    trustedCountries: string[] | undefined,
    country?: string,
  ): void {
    if (!trustedCountries?.length || !country) return;

    if (!trustedCountries.includes(country)) {
      throw DomainErrorFactory.countryNotTrusted();
    }
  }

  /**
   * Valida que exista fingerprint de dispositivo.
   */
  validateDeviceFingerprint(fingerprint?: string): void {
    if (!fingerprint) {
      throw DomainErrorFactory.deviceFingerprintRequired();
    }
  }
}