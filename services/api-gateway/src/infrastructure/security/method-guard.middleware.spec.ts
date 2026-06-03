import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';

import { methodGuardMiddleware } from './method-guard.middleware';

describe('methodGuardMiddleware', () => {
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

  it('debe permitir método GET', () => {
    req.method = 'GET';

    methodGuardMiddleware(
      req as Request,
      res as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalled();
  });

  it('debe permitir método POST', () => {
    req.method = 'POST';

    methodGuardMiddleware(
      req as Request,
      res as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalled();
  });

  it('debe bloquear métodos no permitidos', () => {
    req.method = 'PATCH';

    methodGuardMiddleware(
      req as Request,
      res as Response,
      next as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.METHOD_NOT_ALLOWED,
          message:
            'El método HTTP no está permitido para este recurso',
        }),
        meta: expect.objectContaining({
          path: '/auth/login',
          statusCode: 405,
          lang: 'es',
        }),
      }),
    );

    expect(next).not.toHaveBeenCalled();
  });
});
