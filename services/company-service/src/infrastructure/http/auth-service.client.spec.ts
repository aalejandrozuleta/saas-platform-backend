import { ErrorCode } from '@saas/shared';
import axios from 'axios';

import { AuthServiceHttpClient } from './auth-service.client';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthServiceHttpClient', () => {
  let get: jest.Mock;
  let envService: any;
  let client: AuthServiceHttpClient;

  const buildClient = () => {
    get = jest.fn();
    mockedAxios.create.mockReturnValue({ get } as never);

    envService = {
      get: jest.fn(
        (key: string) =>
          ({
            AUTH_SERVICE_URL: 'http://auth-service:3001',
            AUTH_SERVICE_TIMEOUT: 5000,
            INTERNAL_SERVICE_SECRET: 'secret',
          })[key],
      ),
    };

    return new AuthServiceHttpClient(envService);
  };

  beforeEach(() => {
    mockedAxios.isAxiosError.mockImplementation((error: unknown) =>
      Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
    );
    client = buildClient();
  });

  it('configura baseURL, timeout y el header interno', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://auth-service:3001',
      timeout: 5000,
      headers: { 'x-internal-api-key': 'secret' },
    });
  });

  it('resuelve el usuario desde una respuesta envuelta en `data`', async () => {
    get.mockResolvedValue({ data: { data: { userId: 'u-1', email: 'a@b.com' } } });

    await expect(client.lookupUserByEmail('a@b.com')).resolves.toEqual({
      userId: 'u-1',
      email: 'a@b.com',
    });

    expect(get).toHaveBeenCalledWith('/auth/v1/users/lookup', {
      params: { email: 'a@b.com' },
    });
  });

  it('resuelve el usuario desde una respuesta plana', async () => {
    get.mockResolvedValue({ data: { userId: 'u-1', email: 'a@b.com' } });

    await expect(client.lookupUserByEmail('a@b.com')).resolves.toEqual({
      userId: 'u-1',
      email: 'a@b.com',
    });
  });

  it('devuelve null si la respuesta no trae userId', async () => {
    get.mockResolvedValue({ data: {} });

    await expect(client.lookupUserByEmail('a@b.com')).resolves.toBeNull();
  });

  it('devuelve null ante un 404 de auth-service', async () => {
    get.mockRejectedValue({ isAxiosError: true, response: { status: 404 } });

    await expect(client.lookupUserByEmail('a@b.com')).resolves.toBeNull();
  });

  it('lanza SERVICE_UNAVAILABLE ante un 500 de auth-service', async () => {
    get.mockRejectedValue({ isAxiosError: true, response: { status: 500 } });

    await expect(client.lookupUserByEmail('a@b.com')).rejects.toMatchObject({
      code: ErrorCode.SERVICE_UNAVAILABLE,
    });
  });

  it('lanza SERVICE_UNAVAILABLE ante un error de red/timeout', async () => {
    get.mockRejectedValue(new Error('ETIMEDOUT'));

    await expect(client.lookupUserByEmail('a@b.com')).rejects.toMatchObject({
      code: ErrorCode.SERVICE_UNAVAILABLE,
    });
  });
});
