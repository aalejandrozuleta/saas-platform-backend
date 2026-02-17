import { BaseException } from '@saas/shared';

/**
 * Error lanzado cuando un login requiere verificación adicional
 * debido a un dispositivo no confiable o contexto sospechoso.
 */
export class DeviceNotTrustedError extends BaseException {
  constructor(metadata?: {
    deviceFingerprint?: string;
    country?: string;
    reason?: string;
  }) {
    super(
      'Device not trusted',
      'DEVICE_NOT_TRUSTED',
      {
        httpStatus: 403,
        ...metadata,
      },
    );
  }
}
