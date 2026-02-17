import { UserBlockedError } from '@domain/errors/user-blocked.error';
import { DeviceNotTrustedError } from '@domain/errors/device-not-trusted.error';

export class LoginPolicy {
  private readonly MAX_ATTEMPTS = 5;

  validateAttempts(failedAttempts: number, blockedUntil?: Date): void {
    if (blockedUntil && blockedUntil > new Date()) {
      throw new UserBlockedError(blockedUntil);
    }

    if (failedAttempts >= this.MAX_ATTEMPTS) {
      throw new UserBlockedError();
    }
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
    if (!trustedCountries?.length) return;
    if (!country) return;

    if (!trustedCountries.includes(country)) {
      throw new DeviceNotTrustedError();
    }
  }
}
