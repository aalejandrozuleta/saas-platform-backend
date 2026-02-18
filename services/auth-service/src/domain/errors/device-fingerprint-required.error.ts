/**
 * Error lanzado cuando el fingerprint es obligatorio.
 */
export class DeviceFingerprintRequiredError extends Error {
  constructor() {
    super('DEVICE_FINGERPRINT_REQUIRED');
  }
}
