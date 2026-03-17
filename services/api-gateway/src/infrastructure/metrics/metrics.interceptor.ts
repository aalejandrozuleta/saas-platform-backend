import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const method: string = request.method;

    const rawRoute =
      request.route?.path ?? request.baseUrl ?? request.url ?? 'unknown';

    // Avoid high-cardinality labels: strip API version and query string.
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

