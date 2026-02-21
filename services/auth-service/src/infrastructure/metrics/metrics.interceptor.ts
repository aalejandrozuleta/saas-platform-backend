import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

import { MetricsService } from './metrics.service';

/**
 * Interceptor global para capturar métricas HTTP.
 *
 * - Cuenta requests
 * - Mide latencia
 * - Normaliza rutas
 * - Incluye label "service"
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const method: string = request.method;

    /**
     * Normalización de ruta para evitar
     * cardinalidad innecesaria por versionado.
     */
    const rawRoute =
      request.route?.path ??
      request.baseUrl ??
      request.url ??
      'unknown';

    const normalizedRoute =
      rawRoute.replace(/^\/auth\/v\d+/, '') || '/';

    const serviceName = this.metricsService.getServiceName();

    /**
     * Inicia medición de duración
     */
    const endTimer =
      this.metricsService.httpRequestDuration.startTimer({
        method,
        route: normalizedRoute,
        service: serviceName,
      });

    this.metricsService.httpRequestsInFlight.inc();

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
        this.metricsService.httpRequestsInFlight.dec();

        endTimer({
          status: String(response.statusCode),
          service: serviceName,
        });
      }),
    );
  }
}