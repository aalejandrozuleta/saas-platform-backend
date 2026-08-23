import { HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { type EnvService } from '@config/env/env.service';

import { CompanyProxy } from './company.proxy';

// Mock del ResilientHttpClient
jest.mock('../client/resilient-http.client', () => ({
  ResilientHttpClient: jest.fn().mockImplementation(() => ({
    requestTyped: jest.fn(),
  })),
}));

describe('CompanyProxy', () => {
  let proxy: CompanyProxy;
  let mockClient: { requestTyped: jest.Mock };
  let logger: any;

  const makeReq = (overrides: any = {}) => ({
    method: 'POST',
    body: {},
    headers: { 'accept-language': 'es' },
    originalUrl: '/companies',
    url: '/companies',
    path: '/companies',
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    const envService = {
      get: jest.fn((key: string) => {
        const map: Record<string, unknown> = {
          COMPANY_SERVICE_URL: 'http://company:3004',
          COMPANY_SERVICE_TIMEOUT: 5000,
          COMPANY_SERVICE_CIRCUIT_TIMEOUT: 10000,
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

    proxy = new CompanyProxy(envService, logger);
    mockClient = (proxy as any).client;
  });

  describe('forward — flujo exitoso', () => {
    it('debe retornar el body del upstream', async () => {
      mockClient.requestTyped.mockResolvedValue({
        data: { success: true },
        headers: {},
      });

      const result = await proxy.forward(makeReq(), '/companies');

      expect(result.body).toEqual({ success: true });
    });

    it('debe reenviar la query string original (paginación/filtros)', async () => {
      mockClient.requestTyped.mockResolvedValue({ data: { success: true }, headers: {} });

      await proxy.forward(
        makeReq({ query: { page: '2', role: 'WORKER' } }),
        '/companies/1/members',
      );

      expect(mockClient.requestTyped).toHaveBeenCalledWith(
        expect.objectContaining({ params: { page: '2', role: 'WORKER' } }),
      );
    });
  });

  describe('forward — errores del upstream', () => {
    it('debe lanzar HttpException 503 cuando el circuit breaker está abierto', async () => {
      const circuitError = Object.assign(new Error('circuit open'), {
        code: 'EOPENBREAKER',
      });
      mockClient.requestTyped.mockRejectedValue(circuitError);

      await expect(proxy.forward(makeReq(), '/companies')).rejects.toThrow(HttpException);

      expect(logger.warn).toHaveBeenCalledWith('Company service circuit open', expect.any(Object));
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

      await expect(proxy.forward(makeReq(), '/companies/1')).rejects.toThrow(HttpException);
    });

    it('debe lanzar HttpException 503 cuando el upstream no responde (sin response)', async () => {
      const axiosError = new AxiosError('Network Error', 'ECONNREFUSED', { headers: {} } as any, {
        /* request object */
      });
      Object.defineProperty(axiosError, 'request', { value: {} });
      mockClient.requestTyped.mockRejectedValue(axiosError);

      await expect(proxy.forward(makeReq(), '/companies')).rejects.toThrow(HttpException);

      expect(logger.warn).toHaveBeenCalledWith(
        'Company service upstream no response',
        expect.any(Object),
      );
    });

    it('debe lanzar HttpException 502 para error desconocido no-Axios', async () => {
      mockClient.requestTyped.mockRejectedValue(new Error('unknown'));

      await expect(proxy.forward(makeReq(), '/companies')).rejects.toThrow(HttpException);

      expect(logger.error).toHaveBeenCalledWith(
        'Company service upstream unknown failure',
        expect.any(Object),
      );
    });

    it('debe lanzar HttpException cuando AxiosError no tiene ni response ni request', async () => {
      const axiosError = new AxiosError('No response or request', 'UNKNOWN');
      mockClient.requestTyped.mockRejectedValue(axiosError);

      await expect(proxy.forward(makeReq(), '/companies')).rejects.toThrow(HttpException);
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

      await expect(proxy.forward(makeReq(), '/companies')).rejects.toThrow(HttpException);

      expect(logger.warn).toHaveBeenCalledWith('Company service upstream 5xx', expect.any(Object));
    });
  });

  describe('forwardMultipart', () => {
    const makeFile = () => ({
      buffer: Buffer.from('fake-image-bytes'),
      originalname: 'logo.png',
      mimetype: 'image/png',
    });

    it('debe retornar el body del upstream', async () => {
      mockClient.requestTyped.mockResolvedValue({
        data: { success: true },
        headers: {},
      });

      const result = await proxy.forwardMultipart(makeReq(), '/companies/1/logo', makeFile());

      expect(result.body).toEqual({ success: true });
    });

    it('no debe reenviar el content-type original del cliente (boundary distinto al del nuevo FormData)', async () => {
      mockClient.requestTyped.mockResolvedValue({ data: {}, headers: {} });

      const req = makeReq({
        headers: { 'content-type': 'multipart/form-data; boundary=client-boundary-xyz' },
      });

      await proxy.forwardMultipart(req, '/companies/1/logo', makeFile());

      const sentConfig = mockClient.requestTyped.mock.calls[0][0];
      expect(sentConfig.headers['content-type']).not.toContain('client-boundary-xyz');
      expect(sentConfig.headers['content-type']).toContain('multipart/form-data');
    });

    it('debe traducir errores del upstream igual que forward', async () => {
      mockClient.requestTyped.mockRejectedValue({ code: 'EOPENBREAKER' });

      await expect(
        proxy.forwardMultipart(makeReq(), '/companies/1/logo', makeFile()),
      ).rejects.toThrow(HttpException);
    });
  });
});
