import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import axios, {
  AxiosError,
  AxiosInstance,
  Method,
} from 'axios';
import CircuitBreaker from 'opossum';
import { EnvService } from '@config/env/env.service';
import type { AxiosRequestConfig } from 'axios';



/**
 * Proxy resiliente hacia el Auth Service.
 *
 * Incluye:
 * - Retry controlado
 * - Timeout
 * - Circuit breaker
 */
@Injectable()
export class AuthProxy {
  private readonly client: AxiosInstance;
  private readonly breaker: CircuitBreaker<[AxiosRequestConfig], any>;
  private readonly AUTH_BASE_PATH = '/auth/v1';

  constructor(private readonly envService: EnvService) {
    this.client = axios.create({
      baseURL: this.envService.get('AUTH_SERVICE_URL'),
      timeout: this.envService.get('AUTH_SERVICE_TIMEOUT') ?? 5000,
    });

    this.breaker = new CircuitBreaker(
      (config: AxiosRequestConfig) => this.client.request(config),
      {
        timeout: this.envService.get('AUTH_SERVICE_CIRCUIT_TIMEOUT') ?? 10000,
        errorThresholdPercentage: 50,
        resetTimeout: 15000,
      },
    );
  }

  async forward<T = unknown>(
    req: Request,
    path: string,
  ): Promise<{ data: T; cookies?: string[] }> {

    const config: AxiosRequestConfig = {
      url: `${this.AUTH_BASE_PATH}${path}`,
      method: req.method as Method,
      data: req.body,
      headers: this.extractHeaders(req),
    };

    try {
      const response: any =
        await this.retryRequest(config);

      return {
        data: response.data,
        cookies: response.headers['set-cookie'],
      };

    } catch (error) {

      if (error instanceof AxiosError) {

        if (error.response) {
          throw new HttpException(
            error.response.data ?? {
              message: 'Upstream error',
            },
            error.response.status,
          );
        }

        if (error.request) {
          throw new HttpException(
            'Auth service unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
      }

      throw new HttpException(
        'Gateway upstream failure',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Ejecuta request con retry controlado
   */
  private async retryRequest(
    config: AxiosRequestConfig,
  ) {

    const retries =
      this.envService.get('AUTH_SERVICE_RETRIES') ?? 2;

    let attempt = 0;

    while (true) {

      try {
        return await this.breaker.fire(config);
      } catch (error) {

        attempt++;

        if (attempt > retries) {
          throw error;
        }
      }
    }
  }

  /**
   * Filtra headers seguros
   */
  private extractHeaders(req: Request): Record<string, string> {

    const headers: Record<string, string> = {};

    const copy = (key: string) => {
      const value = req.headers[key];
      if (typeof value === 'string') {
        headers[key] = value;
      }
    };

    copy('content-type');
    copy('authorization');
    copy('accept-language');
    copy('x-correlation-id');
    copy('x-country');
    copy('x-device-fingerprint');
    copy('cookie');

    return headers;
  }
}