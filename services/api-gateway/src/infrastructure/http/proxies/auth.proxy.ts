import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { Method, AxiosRequestConfig, AxiosError } from 'axios';
import {
  ErrorCode,
  getErrorCodeFromHttpStatus,
  isApiErrorResponse,
} from '@saas/shared';
import { EnvService } from '@config/env/env.service';

import { buildGatewayErrorResponse } from '../../errors/gateway-error-response.util';
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
  ): Promise<{ body: T; cookies?: string[] }> {

    try {
      const config: AxiosRequestConfig = {
        url: `${this.AUTH_BASE_PATH}${path}`,
        method: req.method as Method,
        data: req.body,
        headers: forwardHeaders(req),
      };

      const response = await this.client.request(config);

      return {
        body: response.data,
        cookies: response.headers['set-cookie'],
      };
    } catch (error: any) {

      if (error?.code === 'EOPENBREAKER') {
        throw new HttpException(
          buildGatewayErrorResponse(
            req,
            HttpStatus.SERVICE_UNAVAILABLE,
            ErrorCode.SERVICE_UNAVAILABLE,
            'common.auth_service_temporarily_unavailable',
          ),
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (error instanceof AxiosError) {

        if (error.response) {
          if (isApiErrorResponse(error.response.data)) {
            throw new HttpException(
              error.response.data,
              error.response.status,
            );
          }

          throw new HttpException(
            buildGatewayErrorResponse(
              req,
              error.response.status,
              getErrorCodeFromHttpStatus(error.response.status),
              'common.upstream_error',
              {
                details: error.response.data,
              },
            ),
            error.response.status,
          );
        }

        if (error.request) {
          throw new HttpException(
            buildGatewayErrorResponse(
              req,
              HttpStatus.SERVICE_UNAVAILABLE,
              ErrorCode.SERVICE_UNAVAILABLE,
              'common.auth_service_unavailable',
            ),
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
      }

      throw new HttpException(
        buildGatewayErrorResponse(
          req,
          HttpStatus.BAD_GATEWAY,
          ErrorCode.BAD_GATEWAY,
          'common.gateway_upstream_failure',
        ),
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
