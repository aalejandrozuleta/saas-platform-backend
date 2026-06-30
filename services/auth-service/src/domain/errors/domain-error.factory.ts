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

  static securityChallengeRequired(
    metadata: Record<string, unknown>,
  ): DomainException {
    return DomainException.create(
      'auth.security_challenge_required',
      ErrorCode.SECURITY_CHALLENGE_REQUIRED,
      403,
      metadata,
    );
  }

  static invalidRefreshToken(): DomainException {
    return DomainException.create(
      'auth.invalid_refresh_token',
      ErrorCode.INVALID_REFRESH_TOKEN,
      401,
    );
  }

  static invalidCurrentPassword(): DomainException {
    return DomainException.create(
      'auth.invalid_current_password',
      ErrorCode.INVALID_CURRENT_PASSWORD,
      401,
    );
  }

  static samePasswordNotAllowed(): DomainException {
    return DomainException.create(
      'auth.same_password_not_allowed',
      ErrorCode.SAME_PASSWORD_NOT_ALLOWED,
      422,
    );
  }

  static twoFactorAlreadyEnabled(): DomainException {
    return DomainException.create(
      'auth.two_factor_already_enabled',
      ErrorCode.TWO_FACTOR_ALREADY_ENABLED,
      409,
    );
  }

  static twoFactorNotEnabled(): DomainException {
    return DomainException.create(
      'auth.two_factor_not_enabled',
      ErrorCode.TWO_FACTOR_NOT_ENABLED,
      422,
    );
  }

  static invalidTotpCode(): DomainException {
    return DomainException.create(
      'auth.invalid_totp_code',
      ErrorCode.INVALID_TOTP_CODE,
      401,
    );
  }

  static twoFactorSetupNotInitiated(): DomainException {
    return DomainException.create(
      'auth.two_factor_setup_not_initiated',
      ErrorCode.TWO_FACTOR_SETUP_NOT_INITIATED,
      422,
    );
  }

  static trustedCountryAlreadyExists(): DomainException {
    return DomainException.create(
      'auth.trusted_country_already_exists',
      ErrorCode.TRUSTED_COUNTRY_ALREADY_EXISTS,
      409,
    );
  }

  static trustedCountryNotFound(): DomainException {
    return DomainException.create(
      'auth.trusted_country_not_found',
      ErrorCode.TRUSTED_COUNTRY_NOT_FOUND,
      404,
    );
  }

  static trustedCountryLimitReached(): DomainException {
    return DomainException.create(
      'auth.trusted_country_limit_reached',
      ErrorCode.TRUSTED_COUNTRY_LIMIT_REACHED,
      422,
    );
  }

  static sessionNotFound(): DomainException {
    return DomainException.create(
      'auth.session_not_found',
      ErrorCode.SESSION_NOT_FOUND,
      404,
    );
  }

  static emailNotVerified(): DomainException {
    return DomainException.create(
      'auth.email_not_verified',
      ErrorCode.EMAIL_NOT_VERIFIED,
      403,
    );
  }

  static invalidVerificationToken(): DomainException {
    return DomainException.create(
      'auth.invalid_verification_token',
      ErrorCode.INVALID_VERIFICATION_TOKEN,
      400,
    );
  }

  static emailAlreadyVerified(): DomainException {
    return DomainException.create(
      'auth.email_already_verified',
      ErrorCode.EMAIL_ALREADY_VERIFIED,
      409,
    );
  }
}
