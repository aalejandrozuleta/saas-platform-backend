import { BaseException, ErrorCode } from '@saas/shared';

/**
 * Error lanzado cuando el fingerprint es obligatorio.
 */

export class DeviceFingerprintRequiredError extends BaseException {
  constructor() {
    super(
      'Device fingerprint required',
      ErrorCode.DEVICE_FINGERPRINT_REQUIRED,
      400
    );
  }
}