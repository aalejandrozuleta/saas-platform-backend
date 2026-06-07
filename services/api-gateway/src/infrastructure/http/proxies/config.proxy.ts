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

/**
 * Proxy que reenvía peticiones de configuración al config-service.
 *
 * @remarks
 * Usa `ResilientHttpClient` con circuit breaker para tolerar fallos
 * del config-service sin afectar el resto del gateway.
 */
@Injectable()
export class ConfigProxy {
  private readonly client: ResilientHttpClient;
  private readonly CONFIG_BASE_PATH = '/config/v1';

  constructor(
    private readonly env: EnvService,
    @Inject(PLATFORM_LOGGER)
    private readonly logger: PlatformLogger,
  ) {
    this.client = new ResilientHttpClient(
      this.env.get('CONFIG_SERVICE_URL'),
      this.env.get('CONFIG_SERVICE_TIMEOUT'),
      this.env.get('CONFIG_SERVICE_CIRCUIT_TIMEOUT'),
      this.logger,
    );
  }

  async forward<T>(req: Request, path: string): Promise<{ body: T }> {
    try {
      const config: AxiosRequestConfig = {
        url: `${this.CONFIG_BASE_PATH}${path}`,
        method: req.method as Method,
        data: req.body,
        headers: forwardHeaders(req),
      };

      const response = await this.client.requestTyped<T>(config);
      return { body: response.data };
    } catch (error: unknown) {
      this.handleForwardError(req, path, error);
    }
  }

  private handleForwardError(req: Request, path: string, error: unknown): never {
    if (
      typeof error === 'object' && error !== null &&
      'code' in error && error.code === 'EOPENBREAKER'
    ) {
      this.logger.warn('Config service circuit open', {
        event: 'config.upstream.circuit_open', path, method: req.method,
      });
      throw new HttpException(
        buildGatewayErrorResponse(req, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.SERVICE_UNAVAILABLE, 'common.config_service_temporarily_unavailable'),
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (error instanceof AxiosError) {
      if (error.response) {
        if (error.response.status >= 500) {
          this.logger.warn('Config service 5xx', { event: 'config.upstream.5xx', path, method: req.method, status: error.response.status });
        }
        if (isApiErrorResponse(error.response.data)) {
          throw new HttpException(error.response.data, error.response.status);
        }
        throw new HttpException(
          buildGatewayErrorResponse(req, error.response.status, getErrorCodeFromHttpStatus(error.response.status), 'common.upstream_error', { details: error.response.data }),
          error.response.status,
        );
      }

      throw new HttpException(
        buildGatewayErrorResponse(req, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.SERVICE_UNAVAILABLE, 'common.config_service_unavailable'),
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    this.logger.error('Config service unknown failure', { event: 'config.upstream.unknown_error', path, method: req.method });
    throw new HttpException(
      buildGatewayErrorResponse(req, HttpStatus.BAD_GATEWAY, ErrorCode.BAD_GATEWAY, 'common.gateway_upstream_failure'),
      HttpStatus.BAD_GATEWAY,
    );
  }
}
