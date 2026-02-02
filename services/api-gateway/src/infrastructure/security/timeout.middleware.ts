import type { Request, Response, NextFunction } from 'express';

/**
 * Evita que el gateway quede colgado si un servicio no responde.
 */
export function timeoutMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setTimeout(10_000, () => {
    if (!res.headersSent) {
      res.status(504).json({ error: 'Gateway Timeout' });
    }
  });

  next();
}
