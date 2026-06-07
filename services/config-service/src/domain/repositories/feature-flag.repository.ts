import { FeatureFlag } from '@domain/entities/feature-flag/feature-flag.entity';

export interface FeatureFlagFilter {
  tenantId?: string | null;
  role?: string | null;
  environment?: string | null;
  enabled?: boolean;
}

export interface FeatureFlagRepository {
  findByKey(key: string, filter?: FeatureFlagFilter): Promise<FeatureFlag | null>;
  findAll(filter?: FeatureFlagFilter): Promise<FeatureFlag[]>;
  save(flag: FeatureFlag): Promise<FeatureFlag>;
  delete(id: string): Promise<void>;
}
