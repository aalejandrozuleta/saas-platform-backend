import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import axios, { AxiosError, AxiosInstance } from 'axios';

/**
 * Proxy HTTP hacia el Auth Service
 *
 * Centraliza:
 * - Base URL
 * - Timeouts
 * - Forward de headers
 * - Manejo de errores
 */
@Injectable()
export class AuthProxy {
  private readonly client: AxiosInstance;
  private readonly AUTH_BASE_PATH = '/auth/v1';

  constructor() {
    this.client = axios.create({
      baseURL: process.env.AUTH_SERVICE_URL ?? 'http://auth-service:3001',
      timeout: 5000,
    });
  }

  /**
   * Reenvía una request al Auth Service
   *
   * @param req Request original
   * @param path Path interno del auth-service (sin /auth)
   */
  async forward<T = unknown>(
    req: Request,
    path: string,
  ): Promise<T> {
    try {
      const response = await this.client.request<T>({
        url: `${this.AUTH_BASE_PATH}${path}`,
        method: req.method as any,
        data: req.body,
        headers: this.extractHeaders(req),
      });

      return response.data;
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
        'Unexpected gateway error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Extrae y filtra headers relevantes
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

    headers['x-forwarded-for'] = req.ip ?? '';

    return headers;
  }

}
