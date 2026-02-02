import type { Request, Response, NextFunction } from 'express';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const ALLOWED_METHODS = new Set<HttpMethod>([
  'GET',
  'POST',
  'PUT',
  'DELETE',
]);

export function methodGuardMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!ALLOWED_METHODS.has(req.method as HttpMethod)) {
    res.status(405).json({
      error: 'Method Not Allowed',
    });
    return;
  }

  next();
}
