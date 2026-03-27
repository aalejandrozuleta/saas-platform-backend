import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  AxiosError,
  type AxiosRequestConfig,
  type Method,
} from 'axios';
import type { Request } from 'express';
import {
  ErrorCode,
  getErrorCodeFromHttpStatus,
  isApiErrorResponse,
  PLATFORM_LOGGER,
} from '@saas/shared';
import type { PlatformLogger } from '@saas/shared';
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
    @Inject(PLATFORM_LOGGER)
    private readonly logger: PlatformLogger,
  ) {
    this.client = new ResilientHttpClient(
      this.env.get('AUTH_SERVICE_URL'),
      this.env.get('AUTH_SERVICE_TIMEOUT'),
      this.env.get('AUTH_SERVICE_CIRCUIT_TIMEOUT'),
      this.logger,
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

      const response = await this.client.requestTyped<T>(config);

      return {
        body: response.data,
        cookies: response.headers['set-cookie'],
      };
    } catch (error: unknown) {
      this.handleForwardError(req, path, error);
    }
  }

  private handleForwardError(
    req: Request,
    path: string,
    error: unknown,
  ): never {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'EOPENBREAKER'
    ) {
      this.throwCircuitOpenError(req, path);
    }

    if (error instanceof AxiosError) {
      this.handleAxiosError(req, path, error);
    }

    this.throwUnknownUpstreamError(req, path);
  }

  private handleAxiosError(req: Request, path: string, error: AxiosError): never {
    if (error.response) {
      this.throwAxiosResponseError(
        req,
        path,
        error.response.status,
        error.response.data,
      );
    }

    if (error.request) {
      this.logger.warn('Auth service upstream no response', {
        event: 'auth.upstream.no_response',
        path,
        method: req.method,
      });
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

    this.throwUnknownUpstreamError(req, path);
  }

  private throwCircuitOpenError(req: Request, path: string): never {
    this.logger.warn('Auth service circuit open', {
      event: 'auth.upstream.circuit_open',
      path,
      method: req.method,
    });
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

  private throwAxiosResponseError(
    req: Request,
    path: string,
    status: number,
    data: unknown,
  ): never {
    if (status >= 500) {
      this.logger.warn('Auth service upstream 5xx', {
        event: 'auth.upstream.5xx',
        path,
        method: req.method,
        status,
      });
    }

    if (isApiErrorResponse(data)) {
      throw new HttpException(data, status);
    }

    throw new HttpException(
      buildGatewayErrorResponse(
        req,
        status,
        getErrorCodeFromHttpStatus(status),
        'common.upstream_error',
        {
          details: data,
        },
      ),
      status,
    );
  }

  private throwUnknownUpstreamError(req: Request, path: string): never {
    this.logger.error('Auth service upstream unknown failure', {
      event: 'auth.upstream.unknown_error',
      path,
      method: req.method,
    });
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
