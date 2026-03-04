import type { Request, Response, NextFunction } from 'express';

import { headerValidationMiddleware } from './header-validation.middleware';

describe('headerValidationMiddleware', () => {
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

  it('debe permitir requests GET sin content-type', () => {
    req.method = 'GET';
    req.headers = {};

    headerValidationMiddleware(
      req as Request,
      res as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalled();
  });

  it('debe permitir requests POST con application/json', () => {
    req.method = 'POST';
    req.headers = {
      'content-type': 'application/json',
    };

    headerValidationMiddleware(
      req as Request,
      res as Response,
      next as NextFunction,
    );

    expect(next).toHaveBeenCalled();
  });

  it('debe bloquear requests POST sin application/json', () => {
    req.method = 'POST';
    req.headers = {
      'content-type': 'text/plain',
    };

    headerValidationMiddleware(
      req as Request,
      res as Response,
      next as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Unsupported Media Type. Expected application/json',
    });

    expect(next).not.toHaveBeenCalled();
  });
});