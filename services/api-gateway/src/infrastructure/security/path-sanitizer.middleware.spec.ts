import type { Request, Response, NextFunction } from 'express';

import { pathSanitizerMiddleware } from './path-sanitizer.middleware';

describe('pathSanitizerMiddleware', () => {
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
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid request path',
    });

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
    expect(res.json).toHaveBeenCalledWith({
      error: 'Malformed URL',
    });

    expect(next).not.toHaveBeenCalled();
  });
});