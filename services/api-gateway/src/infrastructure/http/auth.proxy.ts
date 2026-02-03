import { Injectable, HttpException } from '@nestjs/common';
import type { Request } from 'express';
import axios, { AxiosInstance } from 'axios';

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
        url: path,
        method: req.method as any,
        data: req.body,
        headers: this.extractHeaders(req),
      });

      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data ?? 'Auth service error',
        error.response?.status ?? 502,
      );
    }
  }

  /**
   * Extrae y filtra headers relevantes
   */
  private extractHeaders(req: Request): Record<string, string> {
    return {
      'content-type': req.headers['content-type'] as string,
      'authorization': req.headers['authorization'] as string,
      'accept-language': req.headers['accept-language'] as string,
      'x-correlation-id': req.headers['x-correlation-id'] as string,
      'x-forwarded-for': req.ip ?? '',
    };
  }
}
