import { of, lastValueFrom } from 'rxjs';
import { type ExecutionContext, type CallHandler } from '@nestjs/common';

import { MetricsInterceptor } from './metrics.interceptor';
import { type MetricsService } from './metrics.service';

describe('MetricsInterceptor (config-service)', () => {
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
      getServiceName: jest.fn().mockReturnValue('config-service'),
      httpRequestDuration: { startTimer: jest.fn() },
      httpRequestsInFlight: { inc: jest.fn(), dec: jest.fn() },
      httpRequestCounter: { inc: jest.fn() },
    };

    interceptor = new MetricsInterceptor(metricsService as unknown as MetricsService);
  });

  it('registra métricas completas en una request exitosa', async () => {
    const request = {
      method: 'GET',
      route: { path: '/config/v1/maintenance/status' },
    };
    const response = { statusCode: 200 };
    const endTimer = jest.fn();
    metricsService.httpRequestDuration.startTimer.mockReturnValue(endTimer);

    const context = createExecutionContext(request, response);
    const next: CallHandler = { handle: () => of({ data: {} }) };

    await lastValueFrom(interceptor.intercept(context, next));

    expect(metricsService.httpRequestsInFlight.inc).toHaveBeenCalledWith({ service: 'config-service' });
    expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith({
      method: 'GET',
      route: '/maintenance/status',
      status: '200',
      service: 'config-service',
    });
    expect(metricsService.httpRequestsInFlight.dec).toHaveBeenCalledWith({ service: 'config-service' });
    expect(endTimer).toHaveBeenCalledWith({ status: '200', service: 'config-service' });
  });

  it('usa url si route y baseUrl no están disponibles', async () => {
    const request = {
      method: 'POST',
      route: null,
      baseUrl: null,
      url: '/config/v1/feature-flags',
    };
    const response = { statusCode: 201 };
    const endTimer = jest.fn();
    metricsService.httpRequestDuration.startTimer.mockReturnValue(endTimer);

    const context = createExecutionContext(request, response);
    const next: CallHandler = { handle: () => of({}) };

    await lastValueFrom(interceptor.intercept(context, next));

    expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith(
      expect.objectContaining({ route: '/feature-flags' }),
    );
  });

  it('usa "unknown" cuando no hay ruta disponible', async () => {
    const request = {
      method: 'GET',
      route: null,
      baseUrl: null,
      url: null,
    };
    const response = { statusCode: 404 };
    const endTimer = jest.fn();
    metricsService.httpRequestDuration.startTimer.mockReturnValue(endTimer);

    const context = createExecutionContext(request, response);
    const next: CallHandler = { handle: () => of({}) };

    await lastValueFrom(interceptor.intercept(context, next));

    expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith(
      expect.objectContaining({ route: 'unknown' }),
    );
  });

  it('normaliza a "/" cuando la URL queda vacía tras strip del prefijo', async () => {
    const request = {
      method: 'GET',
      route: { path: '/config/v1' },
    };
    const response = { statusCode: 200 };
    const endTimer = jest.fn();
    metricsService.httpRequestDuration.startTimer.mockReturnValue(endTimer);

    const context = createExecutionContext(request, response);
    const next: CallHandler = { handle: () => of({}) };

    await lastValueFrom(interceptor.intercept(context, next));

    expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith(
      expect.objectContaining({ route: '/' }),
    );
  });

  it('usa baseUrl como fallback si route.path no está disponible', async () => {
    const request = {
      method: 'GET',
      route: null,
      baseUrl: '/config/v1/stats',
      url: '/config/v1/stats',
    };
    const response = { statusCode: 200 };
    const endTimer = jest.fn();
    metricsService.httpRequestDuration.startTimer.mockReturnValue(endTimer);

    const context = createExecutionContext(request, response);
    const next: CallHandler = { handle: () => of({}) };

    await lastValueFrom(interceptor.intercept(context, next));

    expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith(
      expect.objectContaining({ route: '/stats' }),
    );
  });
});
