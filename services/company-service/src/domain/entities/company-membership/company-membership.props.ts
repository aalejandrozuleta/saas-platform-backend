import { type MembershipRole } from '@domain/enums/membership-role.enum';
import { type MembershipStatus } from '@domain/enums/membership-status.enum';

/**
 * Propiedades de la entidad CompanyMembership — vínculo entre un usuario
 * (de auth-service) y una empresa.
 */
export interface CompanyMembershipProps {
  readonly id: string;

  /** Empresa a la que pertenece la membresía */
  readonly companyId: string;

  /** Id del User en auth-service (referencia cross-service, sin FK real) */
  readonly userId: string;

  readonly role: MembershipRole;

  readonly status: MembershipStatus;

  readonly createdAt: Date;
  readonly updatedAt: Date;
}
