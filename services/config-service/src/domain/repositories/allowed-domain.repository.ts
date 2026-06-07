export interface AllowedDomainRecord {
  id: string;
  domain: string;
  tenantId: string | null;
  createdAt: Date;
}

export interface AllowedDomainRepository {
  findByDomainAndTenant(domain: string, tenantId?: string | null): Promise<AllowedDomainRecord | null>;
  findAll(tenantId?: string | null): Promise<AllowedDomainRecord[]>;
  save(record: Omit<AllowedDomainRecord, 'id' | 'createdAt'>): Promise<AllowedDomainRecord>;
  delete(id: string): Promise<void>;
}
