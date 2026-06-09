import { Injectable } from '@nestjs/common';
import { BaseMetricsService } from '@saas/shared';

const BUCKETS = [0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 1.5, 2, 3];

@Injectable()
export class MetricsService extends BaseMetricsService {
  constructor() {
    super('config-service', BUCKETS);
  }
}
