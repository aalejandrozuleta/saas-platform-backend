import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Method, AxiosRequestConfig, AxiosError } from 'axios';
import { EnvService } from '@config/env/env.service';

import { ResilientHttpClient } from '../client/resilient-http.client';
import { forwardHeaders } from '../utils/header-forwarder.util';

@Injectable()
export class AuthProxy {

  private readonly client: ResilientHttpClient;
  private readonly AUTH_BASE_PATH = '/auth/v1';

  constructor(
    private readonly env: EnvService,
  ) {

    this.client = new ResilientHttpClient(
      this.env.get('AUTH_SERVICE_URL'),
      this.env.get('AUTH_SERVICE_TIMEOUT'),
      this.env.get('AUTH_SERVICE_CIRCUIT_TIMEOUT'),
    );
  }

  async forward<T>(
    req: Request,
    path: string,
  ): Promise<{ data: T; cookies?: string[] }> {

    try {
      const config: AxiosRequestConfig = {
        url: `${this.AUTH_BASE_PATH}${path}`,
        method: req.method as Method,
        data: req.body,
        headers: forwardHeaders(req),
      };

      const response = await this.client.request(config);

      return {
        data: response.data,
        cookies: response.headers['set-cookie'],
      };

    } catch (error: unknown) {

      // Manejo del circuit breaker
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'EOPENBREAKER'
      ) {
        throw new HttpException(
          'Auth service temporarily unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // Manejo de errores Axios
      if (error instanceof AxiosError) {

        if (error.response) {
          throw new HttpException(
            error.response.data ?? { message: 'Upstream error' },
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
}