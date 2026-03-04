import { ErrorCode } from '@saas/shared';

import { DomainException } from './domain.exception';

/**
 * Fábrica centralizada de errores del dominio Auth.
 */
export class DomainErrorFactory {
  static invalidCredentials(): DomainException {
    return DomainException.create(
      'auth.invalid_credentials',
      ErrorCode.INVALID_CREDENTIALS,
      401,
    );
  }

  static userBlocked(until?: Date): DomainException {
    return DomainException.create(
      'auth.user_blocked',
      ErrorCode.USER_BLOCKED,
      403,
      { blockedUntil: until },
    );
  }

  static deviceFingerprintRequired(): DomainException {
    return DomainException.create(
      'auth.device_fingerprint_required',
      ErrorCode.DEVICE_FINGERPRINT_REQUIRED,
      400,
    );
  }

  static emailAlreadyExists(): DomainException {
    return DomainException.create(
      'auth.email_already_exists',
      ErrorCode.EMAIL_ALREADY_EXISTS,
      409,
    );
  }

  static deviceNotTrusted(): DomainException {
    return DomainException.create(
      'auth.device_not_trusted',
      ErrorCode.DEVICE_NOT_TRUSTED,
      403,
    );
  }

  static countryNotTrusted(): DomainException {
    return DomainException.create(
      'auth.country_not_trusted',
      ErrorCode.COUNTRY_NOT_TRUSTED,
      403,
    );
  }
}
