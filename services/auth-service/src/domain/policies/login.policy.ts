import { UserStatus } from '@domain/enums/user-status.enum';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Política de autenticación.
 * Contiene exclusivamente reglas puras de dominio.
 */
// Duración de bloqueo en minutos por número de lockout acumulado (0-indexed)
const LOCKOUT_SCHEDULE_MINUTES = [5, 15, 30, 60] as const;

export class LoginPolicy {
  constructor(
    private readonly maxAttempts: number = 3,
  ) {}

  /**
   * Valida que el usuario esté activo.
   * PENDING → email no verificado (403), BLOCKED → credenciales inválidas (401).
   */
  validateUserStatus(status: UserStatus): void {
    if (status === UserStatus.PENDING) {
      throw DomainErrorFactory.emailNotVerified();
    }
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
   * Duración del próximo bloqueo en minutos según historial de lockouts.
   * 1er bloqueo: 5min, 2do: 15min, 3ro: 30min, 4to+: 60min.
   */
  lockDuration(lockoutCount: number = 0): number {
    const idx = Math.min(lockoutCount, LOCKOUT_SCHEDULE_MINUTES.length - 1);
    return LOCKOUT_SCHEDULE_MINUTES[idx];
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