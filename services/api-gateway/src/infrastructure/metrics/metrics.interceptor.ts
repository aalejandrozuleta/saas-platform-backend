import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { MetricsService } from './metrics.service';

/**
 * Interceptor global que alimenta las métricas HTTP de Prometheus.
 *
 * @remarks
 * Se engancha al ciclo de vida de cada petición:
 * 1. Al entrar: arranca el timer de `httpRequestDuration` e incrementa
 *    `httpRequestsInFlight`.
 * 2. Al completarse con éxito (`tap`): incrementa `httpRequestCounter`.
 * 3. Al finalizar, con o sin error (`finalize`): decrementa
 *    `httpRequestsInFlight` y detiene el timer con el status code final.
 *
 * La ruta usada como label se normaliza (se quita el prefijo de versión
 * `/v1`, `/v2`, etc. y el query string) para evitar labels de alta
 * cardinalidad en Prometheus.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const method: string = request.method;

    const rawRoute = request.route?.path ?? request.baseUrl ?? request.url ?? 'unknown';

    // Avoid high-cardinality labels: strip API version and query string.
    // split()[0] always returns a string — the ?? fallback is a type-safety guard.
    // istanbul ignore next
    const noQuery = String(rawRoute).split('?')[0] ?? 'unknown';
    const normalizedRoute = noQuery.replace(/^\/v\d+/, '') || '/';

    const serviceName = this.metricsService.getServiceName();

    const endTimer = this.metricsService.httpRequestDuration.startTimer({
      method,
      route: normalizedRoute,
      service: serviceName,
    });

    this.metricsService.httpRequestsInFlight.inc({ service: serviceName });

    return next.handle().pipe(
      tap(() => {
        this.metricsService.httpRequestCounter.inc({
          method,
          route: normalizedRoute,
          status: String(response.statusCode),
          service: serviceName,
        });
      }),
      finalize(() => {
        this.metricsService.httpRequestsInFlight.dec({ service: serviceName });
        endTimer({ status: String(response.statusCode), service: serviceName });
      }),
    );
  }
}
