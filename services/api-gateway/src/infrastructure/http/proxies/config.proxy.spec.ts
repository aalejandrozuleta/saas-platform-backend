import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { type EnvService } from '@config/env/env.service';

import { ConfigProxy } from './config.proxy';

jest.mock('../client/resilient-http.client', () => ({
  ResilientHttpClient: jest.fn().mockImplementation(() => ({
    requestTyped: jest.fn(),
  })),
}));

describe('ConfigProxy', () => {
  let proxy: ConfigProxy;
  let mockClient: { requestTyped: jest.Mock };
  let logger: any;

  const makeReq = (overrides: any = {}) => ({
    method: 'GET',
    body: {},
    headers: { 'accept-language': 'es' },
    originalUrl: '/config/v1/maintenance/status',
    url: '/config/v1/maintenance/status',
    path: '/config/v1/maintenance/status',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const envService = {
      get: jest.fn((key: string) => {
        const map: Record<string, unknown> = {
          CONFIG_SERVICE_URL: 'http://config:3002',
          CONFIG_SERVICE_TIMEOUT: 5000,
          CONFIG_SERVICE_CIRCUIT_TIMEOUT: 10000,
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

    proxy = new ConfigProxy(envService, logger);
    mockClient = (proxy as any).client;
  });

  describe('forward — flujo exitoso', () => {
    it('devuelve el body del upstream en una petición exitosa', async () => {
      mockClient.requestTyped.mockResolvedValue({
        data: { data: { maintenanceEnabled: false } },
        headers: {},
      });

      const result = await proxy.forward(makeReq(), '/maintenance/status');

      expect(result.body).toEqual({ data: { maintenanceEnabled: false } });
    });

    it('reenvía la petición con el path correcto', async () => {
      mockClient.requestTyped.mockResolvedValue({ data: {}, headers: {} });

      await proxy.forward(makeReq({ method: 'POST' }), '/feature-flags');

      expect(mockClient.requestTyped).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/config/v1/feature-flags',
          method: 'POST',
        }),
      );
    });
  });

  describe('forward — errores del upstream', () => {
    it('lanza HttpException 503 cuando el circuit breaker está abierto', async () => {
      const circuitError = Object.assign(new Error('circuit open'), {
        code: 'EOPENBREAKER',
      });
      mockClient.requestTyped.mockRejectedValue(circuitError);

      await expect(proxy.forward(makeReq(), '/maintenance/status')).rejects.toThrow(
        HttpException,
      );

      expect(logger.warn).toHaveBeenCalledWith(
        'Config service circuit open',
        expect.any(Object),
      );
    });

    it('lanza HttpException con el status del upstream en errores 4xx con ApiErrorResponse', async () => {
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

      await expect(proxy.forward(makeReq(), '/feature-flags')).rejects.toThrow(HttpException);
    });

    it('lanza HttpException con el status del upstream en error 4xx genérico', async () => {
      const axiosError = new AxiosError(
        'Bad Request',
        'ERR_BAD_REQUEST',
        { headers: {} } as any,
        {},
        {
          status: 400,
          statusText: 'Bad Request',
          data: { raw: 'error' },
          headers: {},
          config: { headers: {} } as any,
        },
      );
      mockClient.requestTyped.mockRejectedValue(axiosError);

      await expect(proxy.forward(makeReq(), '/maintenance/mode')).rejects.toThrow(HttpException);
    });

    it('loguea warn y lanza HttpException en errores 5xx del upstream', async () => {
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

      await expect(proxy.forward(makeReq(), '/stats')).rejects.toThrow(HttpException);

      expect(logger.warn).toHaveBeenCalledWith(
        'Config service 5xx',
        expect.any(Object),
      );
    });

    it('lanza HttpException 503 cuando el upstream no responde (sin response)', async () => {
      const axiosError = new AxiosError(
        'Network Error',
        'ECONNREFUSED',
        { headers: {} } as any,
      );
      mockClient.requestTyped.mockRejectedValue(axiosError);

      await expect(proxy.forward(makeReq(), '/maintenance/status')).rejects.toThrow(HttpException);
    });

    it('lanza HttpException 502 para errores desconocidos no-Axios', async () => {
      mockClient.requestTyped.mockRejectedValue(new Error('unknown failure'));

      await expect(proxy.forward(makeReq(), '/maintenance/status')).rejects.toThrow(HttpException);

      expect(logger.error).toHaveBeenCalledWith(
        'Config service unknown failure',
        expect.any(Object),
      );
    });
  });
});
