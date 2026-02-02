import type { Request, Response, NextFunction } from 'express';

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Bloquea métodos HTTP no permitidos.
 */
export function methodGuardMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!ALLOWED_METHODS.includes(req.method)) {
    res.status(405).json({
      error: 'Method Not Allowed',
    });
    return;
  }

  next();
}
