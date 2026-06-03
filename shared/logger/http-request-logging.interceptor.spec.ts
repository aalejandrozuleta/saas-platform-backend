import { of, throwError, lastValueFrom } from 'rxjs';
import { type ExecutionContext, type CallHandler } from '@nestjs/common';

import { HttpRequestLoggingInterceptor } from './http-request-logging.interceptor';

describe('HttpRequestLoggingInterceptor', () => {
  let interceptor: HttpRequestLoggingInterceptor;
  let logger: {
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    debug: jest.Mock;
  };

  const makeContext = (req: any, res: any = { statusCode: 200, setHeader: jest.fn() }): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => res,
      }),
    }) as any;

  const makeReq = (overrides: any = {}) => ({
    method: 'GET',
    url: '/test',
    originalUrl: '/test',
    ip: '127.0.0.1',
    headers: { 'accept-language': 'es' },
    ...overrides,
  });

  const makeRes = (statusCode = 200) => ({
    statusCode,
    setHeader: jest.fn(),
  });

  const makeNext = (observable = of({ ok: true })): CallHandler => ({
    handle: () => observable,
  });

  beforeEach(() => {
    logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
    interceptor = new HttpRequestLoggingInterceptor(logger as any);
  });

  it('debe loggear info para request exitosa (2xx)', async () => {
    const req = makeReq();
    const res = makeRes(200);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(logger.info).toHaveBeenCalledWith(
      'HTTP request completed',
      expect.objectContaining({ method: 'GET', status: 200 }),
    );
  });

  it('debe loggear warn para errores de cliente (4xx)', async () => {
    const req = makeReq();
    const res = makeRes(400);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(logger.warn).toHaveBeenCalledWith(
      'HTTP request client error',
      expect.objectContaining({ status: 400 }),
    );
  });

  it('debe loggear error para errores de servidor (5xx)', async () => {
    const req = makeReq();
    const res = makeRes(500);
    const err = new Error('crash');

    await expect(
      lastValueFrom(
        interceptor.intercept(makeContext(req, res), makeNext(throwError(() => err))),
      ),
    ).rejects.toThrow('crash');

    expect(logger.error).toHaveBeenCalledWith(
      'HTTP request failed',
      expect.objectContaining({ status: 500 }),
    );
  });

  it('debe loggear debug para rutas de bajo valor (/metrics)', async () => {
    const req = makeReq({ url: '/metrics', originalUrl: '/metrics' });
    const res = makeRes(200);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(logger.debug).toHaveBeenCalledWith(
      'HTTP request completed',
      expect.objectContaining({ path: '/metrics' }),
    );
  });

  it('debe loggear debug para rutas de bajo valor (/health)', async () => {
    const req = makeReq({ url: '/health', originalUrl: '/health' });
    const res = makeRes(200);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(logger.debug).toHaveBeenCalledWith(
      'HTTP request completed',
      expect.any(Object),
    );
  });

  it('debe propagar x-correlation-id desde la request', async () => {
    const req = makeReq({
      headers: { 'x-correlation-id': 'my-corr-id' },
    });
    const res = makeRes(200);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'my-corr-id');
    expect(logger.info).toHaveBeenCalledWith(
      'HTTP request completed',
      expect.objectContaining({ correlationId: 'my-corr-id' }),
    );
  });

  it('debe generar un correlation-id aleatorio si no viene en la request', async () => {
    const req = makeReq({ headers: {} });
    const res = makeRes(200);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(res.setHeader).toHaveBeenCalledWith(
      'x-correlation-id',
      expect.stringMatching(/^[0-9a-f-]{36}$/),
    );
  });

  it('debe extraer IP de x-forwarded-for si está disponible', async () => {
    const req = makeReq({
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.2' },
    });
    const res = makeRes(200);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(logger.info).toHaveBeenCalledWith(
      'HTTP request completed',
      expect.objectContaining({ ip: '203.0.113.1' }),
    );
  });

  it('debe extraer userId del objeto req.user si está disponible', async () => {
    const req = makeReq({ user: { id: 'user-abc' } });
    const res = makeRes(200);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(logger.info).toHaveBeenCalledWith(
      'HTTP request completed',
      expect.objectContaining({ userId: 'user-abc' }),
    );
  });

  it('debe incluir err en el log cuando el error lanzado es una instancia de Error', async () => {
    const req = makeReq();
    const res = makeRes(500);
    const err = new Error('known error');

    await expect(
      lastValueFrom(
        interceptor.intercept(makeContext(req, res), makeNext(throwError(() => err))),
      ),
    ).rejects.toThrow();

    expect(logger.error).toHaveBeenCalledWith(
      'HTTP request failed',
      expect.objectContaining({ err }),
    );
  });

  it('debe usar statusCode 500 por defecto cuando la response tiene statusCode 0', async () => {
    const req = makeReq();
    const res = { statusCode: 0, setHeader: jest.fn() };
    const err = new Error('fail');

    await expect(
      lastValueFrom(
        interceptor.intercept(makeContext(req, res), makeNext(throwError(() => err))),
      ),
    ).rejects.toThrow();

    expect(logger.error).toHaveBeenCalledWith(
      'HTTP request failed',
      expect.objectContaining({ status: 500 }),
    );
  });

  it('debe usar x-request-id como fallback de correlation-id', async () => {
    const req = makeReq({
      headers: { 'x-request-id': 'req-fallback-id' },
    });
    const res = makeRes(200);

    await lastValueFrom(interceptor.intercept(makeContext(req, res), makeNext()));

    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'req-fallback-id');
  });
});
