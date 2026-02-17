import { DeviceNotTrustedError } from "@domain/errors/device-not-trusted.error";

/**
 * Servicio de validación de dispositivos
 */
export class DeviceValidationService {
  /**
   * Valida si el dispositivo es confiable
   */
  validate(isTrusted: boolean): void {
    if (!isTrusted) {
      throw new DeviceNotTrustedError();
    }
  }
}
