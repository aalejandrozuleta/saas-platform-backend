import { LoginAttemptService } from '../login-attempt.service';
import { DeviceValidationService } from '../device-validation.service';
import { CountryValidationService } from '../country-validation.service';


export class LoginValidationService {
  constructor(
    private readonly loginAttemptService: LoginAttemptService,
    private readonly deviceValidationService: DeviceValidationService,
    private readonly countryValidationService: CountryValidationService,
  ) {}

  validateAttempts(failedAttempts: number, blockedUntil?: Date): void {
    this.loginAttemptService.canAttempt(failedAttempts, blockedUntil);
  }

  validateDevice(isTrusted: boolean): void {
    this.deviceValidationService.validate(isTrusted);
  }

  validateCountry(
    trustedCountries: string[] | undefined,
    country?: string,
  ): void {
    if (trustedCountries?.length) {
      this.countryValidationService.validate(trustedCountries, country);
    }
  }
}
