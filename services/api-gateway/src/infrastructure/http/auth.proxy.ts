import type { Request, Response } from 'express';
import fetch, { Headers } from 'node-fetch';
import { envService } from 'src/config/env';



/**
 * Proxy HTTP hacia el Auth Service.
 * El Gateway NO implementa lógica de autenticación.
 */
export class AuthProxy {
  private static readonly AUTH_SERVICE_URL =
    envService.get('AUTH_SERVICE_URL');

  static async forward(
    req: Request,
    res: Response,
    path: string,
  ): Promise<void> {
    const url = `${this.AUTH_SERVICE_URL}${path}`;

    const headers = new Headers();

    // 🔹 Normalizar headers de Express → HeadersInit
    for (const [key, value] of Object.entries(req.headers)) {
      if (key === 'host') continue;
      if (typeof value === 'string') {
        headers.set(key, value);
      } else if (Array.isArray(value)) {
        headers.set(key, value.join(','));
      }
    }

    const response = await fetch(url, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method)
        ? undefined
        : JSON.stringify(req.body),
    });

    const data = await response.text();

    res.status(response.status).send(data);
  }
}
