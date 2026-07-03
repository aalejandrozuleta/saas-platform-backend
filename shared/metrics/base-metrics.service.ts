import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from 'prom-client';

const DEFAULT_BUCKETS = [0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 2, 3, 5];

/**
 * Clase base para exponer métricas de Prometheus en un microservicio.
 *
 * Crea un `Registry` propio con el label `service` ya configurado y
 * registra automáticamente las métricas por defecto de Node.js
 * (`collectDefaultMetrics`) junto con tres métricas HTTP estándar:
 * contador de requests, duración de requests e in-flight requests.
 *
 * Cada microservicio debe extender esta clase (típicamente con un
 * `@Injectable()` propio) para obtener sus métricas HTTP base sin
 * duplicar la configuración de `prom-client`.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class ConfigServiceMetrics extends BaseMetricsService {
 *   constructor() {
 *     super('config-service');
 *   }
 * }
 * ```
 */
@Injectable()
export abstract class BaseMetricsService {
  protected readonly registry: Registry;

  public readonly httpRequestCounter: Counter<string>;
  public readonly httpRequestDuration: Histogram<string>;
  public readonly httpRequestsInFlight: Gauge<string>;

  /**
   * @param serviceName - Nombre del servicio; se usa como label por
   *   defecto (`service`) en todas las métricas del registry.
   * @param buckets - Buckets (en segundos) para el histograma de duración
   *   de requests. Por defecto, `DEFAULT_BUCKETS`.
   */
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

  /**
   * @returns El nombre del servicio configurado en el constructor.
   */
  getServiceName(): string {
    return this.serviceName;
  }

  /**
   * @returns Las métricas actuales del registry, serializadas en el
   *   formato de texto de Prometheus, listas para exponer en el endpoint
   *   `/metrics`.
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * @returns El content-type que debe usarse al responder el endpoint de
   *   métricas (formato de exposición de Prometheus).
   */
  getContentType(): string {
    return this.registry.contentType;
  }
}
