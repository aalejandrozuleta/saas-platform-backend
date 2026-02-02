import type { Request, Response, NextFunction } from 'express';

/**
 * Previene path traversal y URLs maliciosas.
 */
export function pathSanitizerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const decodedPath = decodeURIComponent(req.path);

    if (decodedPath.includes('..')) {
      res.status(400).json({
        error: 'Invalid request path',
      });
      return;
    }

    next();
  } catch {
    res.status(400).json({
      error: 'Malformed URL',
    });
  }
}
