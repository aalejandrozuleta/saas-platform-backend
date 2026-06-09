import { ErrorCode } from '@saas/shared';

import { DomainException } from './domain.exception';

/**
 * Fábrica centralizada de errores del dominio config-service.
 */
export class DomainErrorFactory {
  static maintenanceWindowNotFound(id: string): DomainException {
    return DomainException.create(
      `config.maintenance_window_not_found`,
      ErrorCode.NOT_FOUND,
      404,
      { id },
    );
  }

  static maintenanceWindowOverlap(): DomainException {
    return DomainException.create(
      'config.maintenance_window_overlap',
      ErrorCode.CONFLICT,
      409,
    );
  }

  static invalidDateRange(): DomainException {
    return DomainException.create(
      'config.invalid_date_range',
      ErrorCode.VALIDATION_ERROR,
      422,
    );
  }

  static featureFlagNotFound(key: string): DomainException {
    return DomainException.create(
      'config.feature_flag_not_found',
      ErrorCode.NOT_FOUND,
      404,
      { key },
    );
  }
}
