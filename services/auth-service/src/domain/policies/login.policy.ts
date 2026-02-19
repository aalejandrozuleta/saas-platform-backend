import { UserBlockedError } from '@domain/errors/user-blocked.error';
import { DeviceNotTrustedError } from '@domain/errors/device-not-trusted.error';
import { InvalidCredentialsError } from '@domain/errors/invalid-credentials.error';
import { DeviceFingerprintRequiredError } from '@domain/errors/device-fingerprint-required.error';
import { UserStatus } from '@domain/enums/user-status.enum';

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
      throw new InvalidCredentialsError();
    }
  }

  validateAttempts(
    failedAttempts: number,
    blockedUntil: Date | undefined,
    now: Date,
  ): void {

    if (blockedUntil && blockedUntil > now) {
      throw new UserBlockedError(blockedUntil);
    }

    if (failedAttempts >= this.maxAttempts) {
      throw new UserBlockedError();
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
      throw new DeviceNotTrustedError();
    }
  }

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

  validateDeviceFingerprint(fingerprint?: string): void {
    if (!fingerprint) {
      throw new DeviceFingerprintRequiredError();
    }
  }
}
