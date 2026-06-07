import { RateLimit } from '@domain/entities/rate-limit/rate-limit.entity';

export interface RateLimitRepository {
  findByEndpointAndTenant(endpoint: string, tenantId?: string | null): Promise<RateLimit | null>;
  findById(id: string): Promise<RateLimit | null>;
  findAll(tenantId?: string | null): Promise<RateLimit[]>;
  save(rateLimit: RateLimit): Promise<RateLimit>;
  delete(id: string): Promise<void>;
}
