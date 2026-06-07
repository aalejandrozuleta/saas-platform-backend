import { BaseException, ErrorCode } from '@saas/shared';

/**
 * Fábrica de errores de dominio del config-service.
 *
 * @remarks
 * Centraliza la creación de excepciones con códigos tipados para
 * que los filtros globales puedan mapearlos a HTTP sin conocer el dominio.
 */
export class DomainErrorFactory {
  static configKeyNotFound(key: string): BaseException {
    return new BaseException(
      `Config key "${key}" not found`,
      ErrorCode.NOT_FOUND,
    );
  }

  static featureFlagNotFound(key: string): BaseException {
    return new BaseException(
      `Feature flag "${key}" not found`,
      ErrorCode.NOT_FOUND,
    );
  }

  static tenantConfigNotFound(tenantId: string): BaseException {
    return new BaseException(
      `Tenant config for "${tenantId}" not found`,
      ErrorCode.NOT_FOUND,
    );
  }

  static ipRuleAlreadyExists(ip: string): BaseException {
    return new BaseException(
      `IP rule for "${ip}" already exists`,
      ErrorCode.CONFLICT,
    );
  }

  static ipRuleNotFound(id: string): BaseException {
    return new BaseException(
      `IP rule "${id}" not found`,
      ErrorCode.NOT_FOUND,
    );
  }

  static maintenanceWindowNotFound(id: string): BaseException {
    return new BaseException(
      `Maintenance window "${id}" not found`,
      ErrorCode.NOT_FOUND,
    );
  }

  static maintenanceWindowOverlap(): BaseException {
    return new BaseException(
      'A maintenance window already exists in that time range',
      ErrorCode.CONFLICT,
    );
  }

  static invalidDateRange(): BaseException {
    return new BaseException(
      'endAt must be after startAt',
      ErrorCode.VALIDATION_ERROR,
    );
  }

  static rateLimitNotFound(id: string): BaseException {
    return new BaseException(
      `Rate limit config "${id}" not found`,
      ErrorCode.NOT_FOUND,
    );
  }

  static allowedDomainAlreadyExists(domain: string): BaseException {
    return new BaseException(
      `Domain "${domain}" is already in the allowed list`,
      ErrorCode.CONFLICT,
    );
  }

  static allowedDomainNotFound(domain: string): BaseException {
    return new BaseException(
      `Domain "${domain}" not found in allowed list`,
      ErrorCode.NOT_FOUND,
    );
  }

  static invalidIpAddress(ip: string): BaseException {
    return new BaseException(
      `"${ip}" is not a valid IP address or CIDR`,
      ErrorCode.VALIDATION_ERROR,
    );
  }
}
