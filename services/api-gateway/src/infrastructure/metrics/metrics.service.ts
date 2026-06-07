import { Injectable } from '@nestjs/common';
import { BaseMetricsService } from '@saas/shared';

const BUCKETS = [0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 2, 3, 5];

@Injectable()
export class MetricsService extends BaseMetricsService {
  constructor() {
    super('api-gateway', BUCKETS);
  }
}
