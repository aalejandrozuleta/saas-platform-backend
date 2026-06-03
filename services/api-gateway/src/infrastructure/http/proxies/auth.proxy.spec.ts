import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { type EnvService } from '@config/env/env.service';

import { AuthProxy } from './auth.proxy';

// Mock del ResilientHttpClient
jest.mock('../client/resilient-http.client', () => ({
  ResilientHttpClient: jest.fn().mockImplementation(() => ({
    requestTyped: jest.fn(),
  })),
}));

describe('AuthProxy', () => {
  let proxy: AuthProxy;
  let mockClient: { requestTyped: jest.Mock };
  let logger: any;

  const makeReq = (overrides: any = {}) => ({
    method: 'POST',
    body: {},
    headers: { 'accept-language': 'es' },
    originalUrl: '/auth/login',
    url: '/auth/login',
    path: '/auth/login',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const envService = {
      get: jest.fn((key: string) => {
        const map: Record<string, unknown> = {
          AUTH_SERVICE_URL: 'http://auth:3001',
          AUTH_SERVICE_TIMEOUT: 5000,
          AUTH_SERVICE_CIRCUIT_TIMEOUT: 10000,
        };
        return map[key];
      }),
    } as unknown as EnvService;

    logger = {
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };

    proxy = new AuthProxy(envService, logger);
    mockClient = (proxy as any).client;
  });

  describe('forward — flujo exitoso', () => {
    it('debe retornar body y cookies del upstream', async () => {
      mockClient.requestTyped.mockResolvedValue({
        data: { success: true },
        headers: { 'set-cookie': ['token=abc'] },
      });

      const result = await proxy.forward(makeReq(), '/login');

      expect(result.body).toEqual({ success: true });
      expect(result.cookies).toEqual(['token=abc']);
    });

    it('debe retornar undefined en cookies si el upstream no las envía', async () => {
      mockClient.requestTyped.mockResolvedValue({
        data: { ok: true },
        headers: {},
      });

      const result = await proxy.forward(makeReq(), '/register');

      expect(result.cookies).toBeUndefined();
    });
  });

  describe('forward — errores del upstream', () => {
    it('debe lanzar HttpException 503 cuando el circuit breaker está abierto', async () => {
      const circuitError = Object.assign(new Error('circuit open'), {
        code: 'EOPENBREAKER',
      });
      mockClient.requestTyped.mockRejectedValue(circuitError);

      await expect(proxy.forward(makeReq(), '/login')).rejects.toThrow(
        HttpException,
      );

      expect(logger.warn).toHaveBeenCalledWith(
        'Auth service circuit open',
        expect.any(Object),
      );
    });

    it('debe lanzar HttpException con el status del upstream cuando responde 4xx', async () => {
      const axiosError = new AxiosError(
        'Not Found',
        'ERR_BAD_REQUEST',
        { headers: {} } as any,
        {},
        {
          status: 404,
          statusText: 'Not Found',
          data: { success: false, error: { code: 'NOT_FOUND' } },
          headers: {},
          config: { headers: {} } as any,
        },
      );
      mockClient.requestTyped.mockRejectedValue(axiosError);

      await expect(proxy.forward(makeReq(), '/login')).rejects.toThrow(
        HttpException,
      );
    });

    it('debe lanzar HttpException 503 cuando el upstream no responde (sin response)', async () => {
      const axiosError = new AxiosError(
        'Network Error',
        'ECONNREFUSED',
        { headers: {} } as any,
        { /* request object */ },
      );
      // Sin response, con request
      Object.defineProperty(axiosError, 'request', { value: {} });
      mockClient.requestTyped.mockRejectedValue(axiosError);

      await expect(proxy.forward(makeReq(), '/login')).rejects.toThrow(
        HttpException,
      );

      expect(logger.warn).toHaveBeenCalledWith(
        'Auth service upstream no response',
        expect.any(Object),
      );
    });

    it('debe lanzar HttpException 502 para error desconocido no-Axios', async () => {
      mockClient.requestTyped.mockRejectedValue(new Error('unknown'));

      await expect(proxy.forward(makeReq(), '/login')).rejects.toThrow(
        HttpException,
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Auth service upstream unknown failure',
        expect.any(Object),
      );
    });

    it('debe loggear warn en 5xx del upstream', async () => {
      const axiosError = new AxiosError(
        'Internal Server Error',
        'ERR_BAD_RESPONSE',
        { headers: {} } as any,
        {},
        {
          status: 500,
          statusText: 'Internal Server Error',
          data: { error: 'crash' },
          headers: {},
          config: { headers: {} } as any,
        },
      );
      mockClient.requestTyped.mockRejectedValue(axiosError);

      await expect(proxy.forward(makeReq(), '/login')).rejects.toThrow(
        HttpException,
      );

      expect(logger.warn).toHaveBeenCalledWith(
        'Auth service upstream 5xx',
        expect.any(Object),
      );
    });
  });
});
