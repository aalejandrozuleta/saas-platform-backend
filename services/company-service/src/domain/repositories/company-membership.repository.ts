import { type MembershipRole } from '../enums/membership-role.enum';
import { type MembershipStatus } from '../enums/membership-status.enum';
import { type CompanyMembership } from '../entities/company-membership/company-membership.entity';

/** Página de resultados de `findByCompanyIdPaged`. */
export interface PagedMemberships {
  items: CompanyMembership[];
  total: number;
}

/** Filtros opcionales de `findByCompanyIdPaged`. */
export interface MembershipListFilters {
  role?: MembershipRole;
  status?: MembershipStatus;
}

/**
 * Contrato de persistencia de CompanyMembership.
 */
export interface CompanyMembershipRepository {
  /** Membresía de un usuario concreto en una empresa concreta (clave natural). */
  findByCompanyAndUser(companyId: string, userId: string): Promise<CompanyMembership | null>;

  /** Todas las membresías de una empresa, sin paginar (uso interno / invariantes). */
  findByCompanyId(companyId: string): Promise<CompanyMembership[]>;

  /**
   * Miembros de una empresa paginados, más el total para construir metadata
   * de paginación. `filters` acota por `role` y/o `status` (ej. solo
   * `INVITED`, para ver invitaciones pendientes).
   */
  findByCompanyIdPaged(
    companyId: string,
    pagination: { skip: number; take: number },
    filters?: MembershipListFilters,
  ): Promise<PagedMemberships>;

  /** Membresía por su id (usada al editar un miembro puntual). */
  findById(id: string): Promise<CompanyMembership | null>;

  /** Todas las membresías (en cualquier empresa) de un usuario — soporta "mis empresas". */
  findByUserId(userId: string): Promise<CompanyMembership[]>;

  save(membership: CompanyMembership): Promise<void>;

  update(membership: CompanyMembership): Promise<void>;

  /** Elimina una membresía por su id (baja definitiva, no un cambio de status). */
  delete(id: string): Promise<void>;

  /**
   * Igual que `update`, pero ejecuta la escritura y el conteo de OWNER
   * activos restantes de la empresa dentro de la misma transacción
   * SERIALIZABLE, devolviendo ambos resultados atómicamente.
   *
   * @remarks
   * Existe para cerrar la ventana de carrera de "leer conteo de OWNERs
   * activos, luego escribir en una transacción aparte": dos requests PATCH
   * concurrentes que degradan a los dos únicos OWNER activos podían pasar
   * ambos la validación si cada uno leía el conteo antes de que el otro
   * escribiera. Usar SERIALIZABLE hace que Postgres aborte una de las dos
   * transacciones en conflicto en vez de dejar el tenant sin OWNER.
   */
  updateAndCountActiveOwners(
    companyId: string,
    membership: CompanyMembership,
  ): Promise<{ updated: CompanyMembership; activeOwners: number }>;

  /**
   * Igual que `delete`, pero ejecuta el borrado y el conteo de OWNER
   * activos restantes dentro de la misma transacción SERIALIZABLE que
   * `updateAndCountActiveOwners`, por la misma razón: quitar (en vez de
   * degradar) al penúltimo OWNER activo tiene la misma ventana de carrera.
   */
  deleteAndCountActiveOwners(
    companyId: string,
    membershipId: string,
  ): Promise<{ activeOwners: number }>;
}
