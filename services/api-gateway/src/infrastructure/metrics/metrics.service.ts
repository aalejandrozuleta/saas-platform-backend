import { Injectable } from '@nestjs/common';
import { BaseMetricsService } from '@saas/shared';

const BUCKETS = [0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 2, 3, 5];

/**
 * Métricas Prometheus del API Gateway.
 *
 * @remarks
 * Especialización de `BaseMetricsService` con el nombre de servicio
 * `api-gateway` y buckets de latencia (en segundos) ajustados a un
 * gateway HTTP de baja latencia. Hereda las métricas base:
 * - `http_requests_total` (Counter): peticiones totales, con labels
 *   `method`, `route`, `status`, `service`.
 * - `http_request_duration_seconds` (Histogram): duración de la petición,
 *   mismos labels.
 * - `http_requests_in_flight` (Gauge): peticiones en curso, label `service`.
 *
 * Estas métricas son alimentadas por `MetricsInterceptor` y expuestas por
 * `MetricsController` en el endpoint de scraping de Prometheus.
 */
@Injectable()
export class MetricsService extends BaseMetricsService {
  constructor() {
    super('api-gateway', BUCKETS);
  }
}
