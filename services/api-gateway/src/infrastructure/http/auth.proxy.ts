import type { Request } from 'express';
import { EnvService } from '@config/env/env.service';

import { AuthServiceUnavailableException } from '../errors/auth-service.exception';


/**
 * Proxy HTTP hacia el Auth Service.
 * Implementa timeout usando AbortController.
 */
export class AuthProxy {
  constructor(private readonly env: EnvService) { }

  async forward<T>(req: Request, path: string): Promise<T> {
    const url = `${this.env.get('AUTH_SERVICE_URL')}${path}`;

    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      if (key === 'host') continue;
      if (typeof value === 'string') headers.set(key, value);
      if (Array.isArray(value)) headers.set(key, value.join(','));
    }

    const controller = new AbortController();
    const timeout = this.env.get('AUTH_SERVICE_TIMEOUT');

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    let response: Response;

    try {
      response = await fetch(url, {
        method: req.method,
        headers,
        body: ['GET', 'HEAD'].includes(req.method)
          ? undefined
          : JSON.stringify(req.body),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new AuthServiceUnavailableException({
          reason: 'timeout',
          timeout,
          service: 'auth',
        });
      }

      throw new AuthServiceUnavailableException({
        reason: 'network_error',
        service: 'auth',
        cause: error,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const text = await response.text();

    if (!response.ok) {
      throw new AuthServiceUnavailableException({
        status: response.status,
        response: text,
        service: 'auth',
      });
    }

    return JSON.parse(text) as T;
  }
}
