import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';

import { pathSanitizerMiddleware } from './path-sanitizer.middleware';

describe('pathSanitizerMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      url: '/auth/login',
      headers: {
        'accept-language': 'es',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('debe permitir paths válidos', () => {
    (req as any).path = '/auth/login';

    pathSanitizerMiddleware(
      req as Request,
      res as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalled();
  });

  it('debe bloquear path traversal', () => {
    (req as any).path = '/auth/../../etc/passwd';

    pathSanitizerMiddleware(
      req as Request,
      res as Response,
      next as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.INVALID_REQUEST_PATH,
          message: 'La ruta solicitada no es válida',
        }),
        meta: expect.objectContaining({
          path: '/auth/login',
          statusCode: 400,
          lang: 'es',
        }),
      }),
    );

    expect(next).not.toHaveBeenCalled();
  });

  it('debe manejar URLs malformadas', () => {
    (req as any).path = '%E0%A4%A'; // secuencia inválida

    pathSanitizerMiddleware(
      req as Request,
      res as Response,
      next as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.MALFORMED_URL,
          message: 'La URL enviada no tiene un formato válido',
        }),
        meta: expect.objectContaining({
          path: '/auth/login',
          statusCode: 400,
          lang: 'es',
        }),
      }),
    );

    expect(next).not.toHaveBeenCalled();
  });
});
