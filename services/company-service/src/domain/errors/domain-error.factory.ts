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

  /** El archivo subido como logo no decodifica como una imagen soportada. */
  static invalidLogoType(): DomainException {
    return DomainException.create('company.invalid_logo_type', ErrorCode.VALIDATION_ERROR, 400);
  }

  /** No se puede registrar un trabajador directamente como OWNER. */
  static ownerRoleNotAllowed(): DomainException {
    return DomainException.create(
      'membership.owner_role_not_allowed',
      ErrorCode.VALIDATION_ERROR,
      400,
    );
  }

  /**
   * Solo un OWNER puede otorgar el rol OWNER a otro miembro (por invitación
   * o edición). Evita que un MANAGER se auto-ascienda o ascienda a un
   * cómplice para tomar control total del tenant.
   */
  static ownerRoleRequiresOwner(): DomainException {
    return DomainException.create('membership.owner_role_requires_owner', ErrorCode.FORBIDDEN, 403);
  }

  /** El endpoint de logo requiere un archivo adjunto. */
  static logoFileRequired(): DomainException {
    return DomainException.create('company.logo_file_required', ErrorCode.VALIDATION_ERROR, 400);
  }

  /** Ya existe una empresa registrada con ese NIT/taxId en el mismo país. */
  static taxIdAlreadyRegistered(): DomainException {
    return DomainException.create(
      'company.tax_id_already_registered',
      ErrorCode.TAX_ID_ALREADY_REGISTERED,
      409,
    );
  }

  /** Solo se puede aceptar/rechazar una membresía que sigue en estado INVITED. */
  static invitationNotPending(): DomainException {
    return DomainException.create('membership.invitation_not_pending', ErrorCode.CONFLICT, 409);
  }

  /**
   * Solo un OWNER puede remover a otro OWNER de la empresa. Mismo espíritu
   * que `ownerRoleRequiresOwner()`, pero para la baja en vez del ascenso: un
   * MANAGER no puede expulsar a los dueños del tenant.
   */
  static cannotRemoveOwner(): DomainException {
    return DomainException.create('membership.cannot_remove_owner', ErrorCode.FORBIDDEN, 403);
  }
}
