import { ErrorCode } from '@saas/shared';

import { DomainException } from './domain.exception';

/**
 * Fábrica centralizada de errores del dominio Company.
 */
export class DomainErrorFactory {
  /** La empresa no existe — o el solicitante no tiene por qué saber que existe. */
  static companyNotFound(): DomainException {
    return DomainException.create('company.not_found', ErrorCode.COMPANY_NOT_FOUND, 404);
  }

  /** Ya existe una membresía para ese usuario en esa empresa. */
  static membershipAlreadyExists(): DomainException {
    return DomainException.create(
      'membership.already_exists',
      ErrorCode.MEMBERSHIP_ALREADY_EXISTS,
      409,
    );
  }

  /** La membresía referenciada no existe en esa empresa. */
  static membershipNotFound(): DomainException {
    return DomainException.create('membership.not_found', ErrorCode.MEMBERSHIP_NOT_FOUND, 404);
  }

  /**
   * El solicitante no tiene rol suficiente (OWNER/MANAGER) para la operación.
   *
   * @remarks
   * Se usa `ErrorCode.FORBIDDEN` genérico: no existe un código dedicado y
   * tampoco conviene inventar uno por regla de autorización.
   */
  static notCompanyOwner(): DomainException {
    return DomainException.create('company.not_owner', ErrorCode.FORBIDDEN, 403);
  }

  /** No se puede dejar la empresa sin ningún OWNER activo. */
  static lastOwnerCannotBeDemoted(): DomainException {
    return DomainException.create('membership.last_owner', ErrorCode.CONFLICT, 409);
  }

  /** El email invitado no corresponde a ningún usuario registrado en auth-service. */
  static userNotFoundForInvite(): DomainException {
    return DomainException.create('membership.user_not_found', ErrorCode.USER_NOT_FOUND, 404);
  }

  /** auth-service no respondió (caído, timeout, error 5xx) al resolver el email. */
  static authServiceUnavailable(): DomainException {
    return DomainException.create(
      'company.auth_service_unavailable',
      ErrorCode.SERVICE_UNAVAILABLE,
      503,
    );
  }
}
