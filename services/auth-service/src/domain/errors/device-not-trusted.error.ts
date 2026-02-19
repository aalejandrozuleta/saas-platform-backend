import { BaseException, ErrorCode } from '@saas/shared';

export class DeviceNotTrustedError extends BaseException {
  constructor(metadata?: {
    deviceFingerprint?: string;
    country?: string;
    reason?: string;
  }) {
    super(
      'Device not trusted',
      ErrorCode.DEVICE_NOT_TRUSTED,
      403,
      metadata
    );
  }
}
