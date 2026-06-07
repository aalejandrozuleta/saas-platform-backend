import { TenantConfig } from '@domain/entities/tenant-config/tenant-config.entity';

export interface TenantConfigRepository {
  findByTenantId(tenantId: string): Promise<TenantConfig | null>;
  findAll(): Promise<TenantConfig[]>;
  save(config: TenantConfig): Promise<TenantConfig>;
  delete(tenantId: string): Promise<void>;
}
