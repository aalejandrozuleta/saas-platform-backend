import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

import { MetricsService } from './metrics.service';

/**
 * Interceptor global que instrumenta cada request HTTP con métricas
 * Prometheus: duración (histograma), conteo por status/método/ruta y
 * requests en vuelo (gauge). Se registra como `APP_INTERCEPTOR` en
 * `MetricsModule`, por lo que aplica a todas las rutas del servicio.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method: string = request.method;
    const rawRoute = request.route?.path ?? request.baseUrl ?? request.url ?? 'unknown';
    // Se quita el prefijo de versión (p. ej. "/company/v1") para que rutas
    // parametrizadas no exploten la cardinalidad de las métricas por versión.
    const normalizedRoute = rawRoute.replace(/^\/company\/v\d+/, '') || '/';

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
