import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
} from 'axios';
import CircuitBreaker from 'opossum';
import { Injectable } from '@nestjs/common';
import type { PlatformLogger } from '@saas/shared';

@Injectable()
export class ResilientHttpClient {

  private readonly client: AxiosInstance;
  private readonly breaker: CircuitBreaker<[AxiosRequestConfig], any>;
  private readonly baseURL: string;

  constructor(
    baseURL: string,
    timeout: number,
    circuitTimeout: number,
    private readonly logger?: PlatformLogger,
  ) {
    this.baseURL = baseURL;

    this.client = axios.create({
      baseURL,
      timeout,
    });

    this.breaker = new CircuitBreaker(
      (config: AxiosRequestConfig) =>
        this.client.request(config),
      {
        timeout: circuitTimeout,
        errorThresholdPercentage: 90,
        resetTimeout: 5000,
        volumeThreshold: 10,
      },
    );

    this.breaker.on('open', () => {
      this.logger?.warn('Circuit breaker opened', {
        event: 'circuit.open',
        baseURL: this.baseURL,
      });
    });

    this.breaker.on('halfOpen', () => {
      this.logger?.info('Circuit breaker half-open', {
        event: 'circuit.half_open',
        baseURL: this.baseURL,
      });
    });

    this.breaker.on('close', () => {
      this.logger?.info('Circuit breaker closed', {
        event: 'circuit.close',
        baseURL: this.baseURL,
      });
    });
  }

  async request(
    config: AxiosRequestConfig,
    retries = 2,
  ) {

    let attempt = 0;

    while (true) {

      try {
        return await this.breaker.fire(config);
      } catch (error) {
        this.logger?.debug('Upstream request failed', {
          event: 'upstream.error',
          baseURL: this.baseURL,
          method: config.method?.toUpperCase(),
          url: config.url,
          attempt,
          retries,
          errorCode:
            error instanceof AxiosError ? error.code : undefined,
          status:
            error instanceof AxiosError
              ? error.response?.status
              : undefined,
        });

        if (!this.shouldRetry(error, config, attempt, retries)) {
          throw error;
        }

        attempt++;
      }
    }
  }

  private shouldRetry(
    error: unknown,
    config: AxiosRequestConfig,
    attempt: number,
    retries: number,
  ): boolean {
    if (attempt >= retries) {
      return false;
    }

    const method = config.method?.toUpperCase();

    if (!method || !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return false;
    }

    if (!(error instanceof AxiosError)) {
      return true;
    }

    if (error.code === 'EOPENBREAKER') {
      return false;
    }

    if (error.response) {
      return error.response.status >= 500;
    }

    return true;
  }
}
