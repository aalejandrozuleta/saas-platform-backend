import type { Request, Response, NextFunction } from 'express';

import { methodGuardMiddleware } from './method-guard.middleware';

describe('methodGuardMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
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
    expect(res.json).toHaveBeenCalledWith({
      error: 'Method Not Allowed',
    });

    expect(next).not.toHaveBeenCalled();
  });
});