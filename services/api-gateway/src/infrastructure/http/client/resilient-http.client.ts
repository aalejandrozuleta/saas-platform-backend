import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import CircuitBreaker from 'opossum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResilientHttpClient {

  private readonly client: AxiosInstance;
  private readonly breaker: CircuitBreaker<[AxiosRequestConfig], AxiosResponse>;

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

        attempt++;

        if (attempt > retries) {
          throw error;
        }
      }
    }
  }
}