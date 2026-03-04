import { ErrorCode } from '@saas/shared';

import { DomainException } from './domain.exception';
import { DomainErrorFactory } from './domain-error.factory';

describe('DomainErrorFactory', () => {
  describe('invalidCredentials', () => {
    it('debe crear excepción INVALID_CREDENTIALS', () => {
      const error = DomainErrorFactory.invalidCredentials();

      expect(error).toBeInstanceOf(DomainException);
      expect(error.message).toBe('auth.invalid_credentials');
      expect(error.code).toBe(ErrorCode.INVALID_CREDENTIALS);
      expect(error.httpStatus).toBe(401);
      expect(error.metadata).toBeUndefined();
    });
  });

  describe('userBlocked', () => {
    it('debe crear excepción USER_BLOCKED con fecha', () => {
      const blockedUntil = new Date();

      const error =
        DomainErrorFactory.userBlocked(blockedUntil);

      expect(error).toBeInstanceOf(DomainException);
      expect(error.message).toBe('auth.user_blocked');
      expect(error.code).toBe(ErrorCode.USER_BLOCKED);
      expect(error.httpStatus).toBe(403);
      expect(error.metadata).toEqual({
        blockedUntil,
      });
    });

    it('debe crear excepción USER_BLOCKED sin fecha', () => {
      const error = DomainErrorFactory.userBlocked();

      expect(error.metadata).toEqual({
        blockedUntil: undefined,
      });
    });
  });

  describe('deviceFingerprintRequired', () => {
    it('debe crear excepción DEVICE_FINGERPRINT_REQUIRED', () => {
      const error =
        DomainErrorFactory.deviceFingerprintRequired();

      expect(error.message).toBe(
        'auth.device_fingerprint_required',
      );
      expect(error.code).toBe(
        ErrorCode.DEVICE_FINGERPRINT_REQUIRED,
      );
      expect(error.httpStatus).toBe(400);
    });
  });

  describe('emailAlreadyExists', () => {
    it('debe crear excepción EMAIL_ALREADY_EXISTS', () => {
      const error =
        DomainErrorFactory.emailAlreadyExists();

      expect(error.message).toBe(
        'auth.email_already_exists',
      );
      expect(error.code).toBe(
        ErrorCode.EMAIL_ALREADY_EXISTS,
      );
      expect(error.httpStatus).toBe(409);
    });
  });

  describe('deviceNotTrusted', () => {
    it('debe crear excepción DEVICE_NOT_TRUSTED', () => {
      const error =
        DomainErrorFactory.deviceNotTrusted();

      expect(error.message).toBe(
        'auth.device_not_trusted',
      );
      expect(error.code).toBe(
        ErrorCode.DEVICE_NOT_TRUSTED,
      );
      expect(error.httpStatus).toBe(403);
    });
  });
});