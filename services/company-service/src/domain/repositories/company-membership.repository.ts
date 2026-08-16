import { type CompanyMembership } from '../entities/company-membership/company-membership.entity';

/**
 * Contrato de persistencia de CompanyMembership.
 */
export interface CompanyMembershipRepository {
  /** Membresía de un usuario concreto en una empresa concreta (clave natural). */
  findByCompanyAndUser(companyId: string, userId: string): Promise<CompanyMembership | null>;

  /** Todas las membresías de una empresa. */
  findByCompanyId(companyId: string): Promise<CompanyMembership[]>;

  /** Membresía por su id (usada al editar un miembro puntual). */
  findById(id: string): Promise<CompanyMembership | null>;

  save(membership: CompanyMembership): Promise<void>;

  update(membership: CompanyMembership): Promise<void>;
}
