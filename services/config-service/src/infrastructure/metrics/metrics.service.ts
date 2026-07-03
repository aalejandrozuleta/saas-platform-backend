import { Injectable } from '@nestjs/common';
import { BaseMetricsService } from '@saas/shared';

/**
 * Buckets (en segundos) del histograma de duración de requests HTTP.
 * Rango pensado para operaciones de configuración, típicamente rápidas
 * (lecturas/escrituras simples en Postgres/Redis/Mongo).
 */
const BUCKETS = [0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 1.5, 2, 3];

/**
 * Servicio de métricas Prometheus de config-service.
 * Reutiliza los contadores/histogramas base (`httpRequestCounter`,
 * `httpRequestDuration`, `httpRequestsInFlight`) definidos en
 * `BaseMetricsService`, etiquetados con el nombre de este servicio.
 */
@Injectable()
export class MetricsService extends BaseMetricsService {
  constructor() {
    super('config-service', BUCKETS);
  }
}
