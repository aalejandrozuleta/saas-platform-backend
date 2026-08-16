import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AxiosError, type AxiosRequestConfig, type Method } from 'axios';
import FormData from 'form-data';
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
 * Proxy que reenvía las peticiones de compañías/membresías al company-service.
 *
 * @remarks
 * Usa `ResilientHttpClient` para manejar fallos de red y circuit breaker.
 * Traduce los errores del upstream a respuestas HTTP estructuradas del gateway.
 */
@Injectable()
export class CompanyProxy {
  private readonly client: ResilientHttpClient;
  private readonly COMPANY_BASE_PATH = '/company/v1';

  constructor(
    private readonly env: EnvService,
    @Inject(PLATFORM_LOGGER)
    private readonly logger: PlatformLogger,
  ) {
    this.client = new ResilientHttpClient(
      this.env.get('COMPANY_SERVICE_URL'),
      this.env.get('COMPANY_SERVICE_TIMEOUT'),
      this.env.get('COMPANY_SERVICE_CIRCUIT_TIMEOUT'),
      this.logger,
    );
  }

  /**
   * Reenvía la petición al company-service y devuelve el body del upstream.
   *
   * @param req - Petición original del cliente
   * @param path - Sub-ruta del company-service (ej. `/companies`)
   */
  async forward<T>(req: Request, path: string): Promise<{ body: T }> {
    try {
      const config: AxiosRequestConfig = {
        url: `${this.COMPANY_BASE_PATH}${path}`,
        method: req.method as Method,
        data: req.body,
        headers: forwardHeaders(req),
      };

      const response = await this.client.requestTyped<T>(config);

      return {
        body: response.data,
      };
    } catch (error: unknown) {
      this.handleForwardError(req, path, error);
    }
  }

  /**
   * Reenvía un archivo (multipart/form-data) al company-service.
   *
   * @remarks
   * Mismo criterio que `AuthProxy.forwardMultipart`: el gateway ya parseó el
   * multipart entrante a un buffer en memoria (vía `FileInterceptor`), así
   * que se reconstruye un nuevo cuerpo multipart para el upstream en vez de
   * reenviar `req.body`.
   *
   * @param file - Archivo ya parseado por multer en el gateway.
   */
  async forwardMultipart<T>(
    req: Request,
    path: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ): Promise<{ body: T }> {
    try {
      const form = new FormData();
      form.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const { 'content-type': _clientContentType, ...headers } = forwardHeaders(req);

      const config: AxiosRequestConfig = {
        url: `${this.COMPANY_BASE_PATH}${path}`,
        method: req.method as Method,
        data: form,
        headers: { ...headers, ...form.getHeaders() },
      };

      const response = await this.client.requestTyped<T>(config);

      return {
        body: response.data,
      };
    } catch (error: unknown) {
      this.handleForwardError(req, path, error);
    }
  }

  private handleForwardError(req: Request, path: string, error: unknown): never {
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
      this.throwAxiosResponseError(req, path, error.response.status, error.response.data);
    }

    if (error.request) {
      this.logger.warn('Company service upstream no response', {
        event: 'company.upstream.no_response',
        path,
        method: req.method,
      });
      throw new HttpException(
        buildGatewayErrorResponse(
          req,
          HttpStatus.SERVICE_UNAVAILABLE,
          ErrorCode.SERVICE_UNAVAILABLE,
          'common.company_service_unavailable',
        ),
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    this.throwUnknownUpstreamError(req, path);
  }

  private throwCircuitOpenError(req: Request, path: string): never {
    this.logger.warn('Company service circuit open', {
      event: 'company.upstream.circuit_open',
      path,
      method: req.method,
    });
    throw new HttpException(
      buildGatewayErrorResponse(
        req,
        HttpStatus.SERVICE_UNAVAILABLE,
        ErrorCode.SERVICE_UNAVAILABLE,
        'common.company_service_temporarily_unavailable',
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
      this.logger.warn('Company service upstream 5xx', {
        event: 'company.upstream.5xx',
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
    this.logger.error('Company service upstream unknown failure', {
      event: 'company.upstream.unknown_error',
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
