import { type Company } from '../entities/company/company.entity';
import { type CompanyMembership } from '../entities/company-membership/company-membership.entity';

/**
 * Contrato de persistencia de Company (tenant).
 */
export interface CompanyRepository {
  findById(id: string): Promise<Company | null>;

  save(company: Company): Promise<void>;

  update(company: Company): Promise<void>;

  /**
   * Crea la empresa y la membresía `OWNER` de quien la creó de forma
   * atómica: una empresa sin dueño sería un tenant huérfano e inaccesible.
   *
   * @remarks
   * El contrato se expresa en términos de entidades de dominio; cómo se
   * consigue la atomicidad (transacción de Prisma, saga, etc.) es
   * responsabilidad exclusiva de la implementación de infraestructura.
   */
  createWithOwnerMembership(company: Company, membership: CompanyMembership): Promise<void>;
}
