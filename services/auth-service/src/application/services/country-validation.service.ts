import { DeviceNotTrustedError } from "@domain/errors/device-not-trusted.error";

/**
 * Servicio de validación por país
 */
export class CountryValidationService {
  /**
   * Valida si el país es confiable
   */
  validate(userCountries: string[], currentCountry?: string): void {
    if (!currentCountry) return;

    if (!userCountries.includes(currentCountry)) {
      throw new DeviceNotTrustedError();
    }
  }
}
