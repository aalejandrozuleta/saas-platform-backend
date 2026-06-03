import { of, lastValueFrom } from 'rxjs';
import { type ExecutionContext, type CallHandler } from '@nestjs/common';

import { MetricsInterceptor } from './metrics.interceptor';
import { type MetricsService } from './metrics.service';

describe('MetricsInterceptor (api-gateway)', () => {
  let interceptor: MetricsInterceptor;
  let metricsService: {
    getServiceName: jest.Mock;
    httpRequestDuration: { startTimer: jest.Mock };
    httpRequestsInFlight: { inc: jest.Mock; dec: jest.Mock };
    httpRequestCounter: { inc: jest.Mock };
  };

  const makeContext = (req: any, res: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    }) as unknown as ExecutionContext;

  const makeNext = (): CallHandler => ({
    handle: () => of({ ok: true }),
  });

  beforeEach(() => {
    metricsService = {
      getServiceName: jest.fn().mockReturnValue('api-gateway'),
      httpRequestDuration: { startTimer: jest.fn().mockReturnValue(jest.fn()) },
      httpRequestsInFlight: { inc: jest.fn(), dec: jest.fn() },
      httpRequestCounter: { inc: jest.fn() },
    };

    interceptor = new MetricsInterceptor(metricsService as unknown as MetricsService);
  });

  it('debe registrar métricas de una request HTTP con route.path', async () => {
    const req = { method: 'POST', route: { path: '/auth' }, statusCode: 200 };
    const res = { statusCode: 200 };
    const endTimer = jest.fn();
    metricsService.httpRequestDuration.startTimer.mockReturnValue(endTimer);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(metricsService.httpRequestsInFlight.inc).toHaveBeenCalledWith({ service: 'api-gateway' });
    expect(metricsService.httpRequestsInFlight.dec).toHaveBeenCalledWith({ service: 'api-gateway' });
    expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', status: '200' }),
    );
    expect(endTimer).toHaveBeenCalled();
  });

  it('debe usar baseUrl cuando route.path no está disponible', async () => {
    const req = { method: 'GET', route: null, baseUrl: '/v1/auth/login', url: '/v1/auth/login' };
    const res = { statusCode: 200 };
    const endTimer = jest.fn();
    metricsService.httpRequestDuration.startTimer.mockReturnValue(endTimer);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith(
      expect.objectContaining({ route: '/auth/login' }),
    );
  });

  it('debe usar "/" cuando la ruta queda vacía después del strip', async () => {
    const req = { method: 'GET', route: { path: '/v1' } };
    const res = { statusCode: 204 };
    const endTimer = jest.fn();
    metricsService.httpRequestDuration.startTimer.mockReturnValue(endTimer);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith(
      expect.objectContaining({ route: '/' }),
    );
  });

  it('debe usar "unknown" cuando no hay ninguna ruta disponible', async () => {
    const req = { method: 'GET', route: null, baseUrl: null, url: null };
    const res = { statusCode: 404 };
    const endTimer = jest.fn();
    metricsService.httpRequestDuration.startTimer.mockReturnValue(endTimer);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(metricsService.httpRequestCounter.inc).toHaveBeenCalledWith(
      expect.objectContaining({ route: 'unknown' }),
    );
  });
});
