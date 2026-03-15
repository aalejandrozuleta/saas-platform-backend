import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
} from 'axios';
import CircuitBreaker from 'opossum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResilientHttpClient {

  private readonly client: AxiosInstance;
  private readonly breaker: CircuitBreaker<[AxiosRequestConfig], any>;

  constructor(
    baseURL: string,
    timeout: number,
    circuitTimeout: number,
  ) {

    this.client = axios.create({
      baseURL,
      timeout,
    });

    this.breaker = new CircuitBreaker(
      (config: AxiosRequestConfig) =>
        this.client.request(config),
      // {
      //   timeout: circuitTimeout,
      //   errorThresholdPercentage: 50,
      //   resetTimeout: 15000,
      // },

      {
        timeout: 10000,
        errorThresholdPercentage: 90,
        resetTimeout: 5000,
        volumeThreshold: 10,
      },
    );
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
