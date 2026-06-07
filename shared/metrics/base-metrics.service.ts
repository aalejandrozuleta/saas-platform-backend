import { Injectable } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from 'prom-client';

const DEFAULT_BUCKETS = [0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 2, 3, 5];

@Injectable()
export abstract class BaseMetricsService {
  protected readonly registry: Registry;

  public readonly httpRequestCounter: Counter<string>;
  public readonly httpRequestDuration: Histogram<string>;
  public readonly httpRequestsInFlight: Gauge<string>;

  constructor(
    private readonly serviceName: string,
    buckets: number[] = DEFAULT_BUCKETS,
  ) {
    this.registry = new Registry();
    this.registry.setDefaultLabels({ service: this.serviceName });

    collectDefaultMetrics({ register: this.registry });

    this.httpRequestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status', 'service'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status', 'service'],
      buckets,
      registers: [this.registry],
    });

    this.httpRequestsInFlight = new Gauge({
      name: 'http_requests_in_flight',
      help: 'Current HTTP requests being processed',
      labelNames: ['service'],
      registers: [this.registry],
    });
  }

  getServiceName(): string {
    return this.serviceName;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
