import type { Request, Response, NextFunction } from 'express';

/**
 * Valida headers mínimos esperados en el gateway.
 * Evita requests malformadas o sospechosas.
 */
export function headerValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (
    req.method !== 'GET' &&
    req.headers['content-type'] !== 'application/json'
  ) {
    res.status(415).json({
      error: 'Unsupported Media Type. Expected application/json',
    });
    return;
  }

  next();
}
