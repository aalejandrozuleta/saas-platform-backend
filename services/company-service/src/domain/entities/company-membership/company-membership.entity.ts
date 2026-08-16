import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { type CompanyMembershipProps } from './company-membership.props';

/**
 * Entidad de dominio CompanyMembership.
 *
 * Vincula un usuario de auth-service con una empresa, con un rol y un
 * estado. Es la unidad de autorización del tenant: quien no tiene
 * membresía en una empresa, no ve nada de esa empresa.
 */
export class CompanyMembership {
  private constructor(private readonly props: CompanyMembershipProps) {}

  /**
   * Fábrica para una membresía nueva.
   *
   * `status` es opcional: el dueño que crea la empresa entra directamente
   * como `ACTIVE`, mientras que un invitado nace en `INVITED` (default).
   */
  static create(props: {
    id: string;
    companyId: string;
    userId: string;
    role: MembershipRole;
    status?: MembershipStatus;
  }): CompanyMembership {
    if (!props.companyId.trim()) {
      throw new Error('MEMBERSHIP_COMPANY_ID_REQUIRED');
    }

    if (!props.userId.trim()) {
      throw new Error('MEMBERSHIP_USER_ID_REQUIRED');
    }

    const now = new Date();

    return new CompanyMembership({
      id: props.id,
      companyId: props.companyId,
      userId: props.userId,
      role: props.role,
      status: props.status ?? MembershipStatus.INVITED,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Reconstrucción desde persistencia.
   * NO aplica reglas de negocio.
   */
  static fromPersistence(props: CompanyMembershipProps): CompanyMembership {
    return new CompanyMembership(props);
  }

  // ======================
  // Getters
  // ======================

  get id(): string {
    return this.props.id;
  }

  get companyId(): string {
    return this.props.companyId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get role(): MembershipRole {
    return this.props.role;
  }

  get status(): MembershipStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ======================
  // Reglas de dominio
  // ======================

  /** `true` si el miembro puede gestionar a otros miembros de la empresa. */
  canManageMembers(): boolean {
    return (
      this.props.status === MembershipStatus.ACTIVE &&
      (this.props.role === MembershipRole.OWNER || this.props.role === MembershipRole.MANAGER)
    );
  }

  /** `true` si el miembro tiene acceso efectivo a los datos de la empresa. */
  isActive(): boolean {
    return this.props.status === MembershipStatus.ACTIVE;
  }

  /** `true` si el miembro es dueño del tenant. */
  isOwner(): boolean {
    return this.props.role === MembershipRole.OWNER;
  }

  /**
   * Cambia el rol devolviendo una nueva instancia (entidad inmutable).
   */
  changeRole(role: MembershipRole): CompanyMembership {
    return new CompanyMembership({
      ...this.props,
      role,
      updatedAt: new Date(),
    });
  }

  /**
   * Cambia el estado devolviendo una nueva instancia (entidad inmutable).
   */
  changeStatus(status: MembershipStatus): CompanyMembership {
    return new CompanyMembership({
      ...this.props,
      status,
      updatedAt: new Date(),
    });
  }
}
