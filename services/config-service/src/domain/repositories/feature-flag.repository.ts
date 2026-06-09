import type { FeatureFlag } from '@domain/entities/feature-flag/feature-flag.entity';

export interface FeatureFlagFilter {
  environment?: string | null;
  enabled?: boolean;
}

export interface FeatureFlagRepository {
  findByKey(key: string, environment?: string | null): Promise<FeatureFlag | null>;
  findAll(filter?: FeatureFlagFilter): Promise<FeatureFlag[]>;
  save(flag: FeatureFlag): Promise<FeatureFlag>;
  delete(id: string): Promise<void>;
}
