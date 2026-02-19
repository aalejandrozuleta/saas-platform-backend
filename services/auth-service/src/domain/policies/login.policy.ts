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

  validateUserStatus(status: UserStatus): void {
    if (status !== UserStatus.ACTIVE) {
      throw DomainErrorFactory.invalidCredentials();
    }
  }

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

  shouldLockAccount(failedAttempts: number): boolean {
    return failedAttempts >= this.maxAttempts;
  }

  lockDuration(): number {
    return this.lockDurationMinutes;
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }

  validateDevice(isTrusted: boolean): void {
    if (!isTrusted) {
      throw DomainErrorFactory.deviceNotTrusted();
    }
  }

  validateCountry(
    trustedCountries: string[] | undefined,
    country?: string,
  ): void {

    if (!trustedCountries?.length || !country) return;

    if (!trustedCountries.includes(country)) {
      throw DomainErrorFactory.deviceNotTrusted();
    }
  }

  validateDeviceFingerprint(fingerprint?: string): void {
    if (!fingerprint) {
      throw DomainErrorFactory.deviceFingerprintRequired  ();
    }
  }
}
