import { HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';
import { EnvService } from '@config/env/env.service';

import { AuthProxy } from './auth.proxy';

jest.mock('axios');

describe('AuthProxy', () => {
  let proxy: AuthProxy;
  let envService: jest.Mocked<EnvService>;
  let axiosInstance: any;

  const mockRequest = {
    method: 'POST',
    body: { email: 'test@test.com' },
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer token',
      'accept-language': 'es',
      'x-correlation-id': 'abc',
      'x-country': 'CO',
      'x-device-fingerprint': 'device123',
    },
  } as unknown as Request;

  beforeEach(() => {
    envService = {
      get: jest.fn((key: string) => {
        if (key === 'AUTH_SERVICE_URL') return 'http://auth-service:3001';
        if (key === 'AUTH_SERVICE_TIMEOUT') return 5000;
      }),
    } as any;

    axiosInstance = {
      request: jest.fn(),
    };

    (axios.create as jest.Mock).mockReturnValue(axiosInstance);

    proxy = new AuthProxy(envService);
  });

  it('debe crear el cliente axios con configuración del env', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://auth-service:3001',
      timeout: 5000,
    });
  });

  it('debe reenviar correctamente una request', async () => {
    axiosInstance.request.mockResolvedValue({
      data: { success: true },
    });

    const result = await proxy.forward(mockRequest, '/login');

    expect(axiosInstance.request).toHaveBeenCalledWith({
      url: '/auth/v1/login',
      method: 'POST',
      data: mockRequest.body,
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token',
        'accept-language': 'es',
        'x-correlation-id': 'abc',
        'x-country': 'CO',
        'x-device-fingerprint': 'device123',
      },
    });

    expect(result).toEqual({ success: true });
  });

  it('debe lanzar HttpException si el upstream responde con error', async () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    } as AxiosError;

    axiosInstance.request.mockRejectedValue(error);

    await expect(proxy.forward(mockRequest, '/login')).rejects.toThrow(
      HttpException,
    );
  });

it('debe lanzar SERVICE_UNAVAILABLE si no hay respuesta del upstream', async () => {
  const error = new AxiosError('Network Error');

  Object.defineProperty(error, 'request', {
    value: {},
  });

  axiosInstance.request.mockRejectedValue(error);

  await expect(proxy.forward(mockRequest, '/login')).rejects.toMatchObject({
    status: HttpStatus.SERVICE_UNAVAILABLE,
  });
});

  it('debe lanzar INTERNAL_SERVER_ERROR en errores inesperados', async () => {
    axiosInstance.request.mockRejectedValue(new Error('unexpected'));

    await expect(proxy.forward(mockRequest, '/login')).rejects.toMatchObject({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });
});