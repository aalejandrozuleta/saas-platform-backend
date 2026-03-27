import { of, lastValueFrom } from 'rxjs';
import { type ExecutionContext, type CallHandler } from '@nestjs/common';

import { MetricsInterceptor } from './metrics.interceptor';
import { type MetricsService } from './metrics.service';

describe('MetricsInterceptor', () => {
  let interceptor: MetricsInterceptor;

  let metricsService: {
    getServiceName: jest.Mock;
    httpRequestDuration: { startTimer: jest.Mock };
    httpRequestsInFlight: { inc: jest.Mock; dec: jest.Mock };
    httpRequestCounter: { inc: jest.Mock };
  };

  const createExecutionContext = (req: any, res: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    metricsService = {
      getServiceName: jest.fn().mockReturnValue('auth-service'),
      httpRequestDuration: {
        startTimer: jest.fn(),
      },
      httpRequestsInFlight: {
        inc: jest.fn(),
        dec: jest.fn(),
      },
      httpRequestCounter: {
        inc: jest.fn(),
      },
    };

    interceptor = new MetricsInterceptor(
      metricsService as unknown as MetricsService,
    );
  });

  it('debería registrar métricas de una request HTTP', async () => {
    const request = {
      method: 'POST',
      route: { path: '/auth/v1/login' },
    };

    const response = {
      statusCode: 200,
    };

    const endTimer = jest.fn();
    metricsService.httpRequestDuration.startTimer.mockReturnValue(endTimer);

    const context = createExecutionContext(request, response);

    const next: CallHandler = {
      handle: () => of({ ok: true }),
    };

    await lastValueFrom(interceptor.intercept(context, next));

    expect(metricsService.httpRequestsInFlight.inc).toHaveBeenCalledWith({
      service: 'auth-service',
    });

    expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith({
      method: 'POST',
      route: '/login',
      status: '200',
      service: 'auth-service',
    });

    expect(metricsService.httpRequestsInFlight.dec).toHaveBeenCalledWith({
      service: 'auth-service',
    });

    expect(endTimer).toHaveBeenCalledWith({
      status: '200',
      service: 'auth-service',
    });
  });
});
