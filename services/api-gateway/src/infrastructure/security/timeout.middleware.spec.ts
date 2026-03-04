import type { Request, Response, NextFunction } from 'express';

import { timeoutMiddleware } from './timeout.middleware';

describe('timeoutMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  let timeoutCallback: (() => void) | undefined;

  beforeEach(() => {
    req = {};

    res = {
      headersSent: false,
      setTimeout: jest.fn((_, cb) => {
        timeoutCallback = cb;
        return res as any;
      }),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    next = jest.fn();
  });

  it('debe registrar timeout de 10 segundos', () => {
    timeoutMiddleware(
      req as Request,
      res as unknown as Response,
      next as NextFunction,
    );

    expect(res.setTimeout).toHaveBeenCalledWith(10000, expect.any(Function));
    expect(next).toHaveBeenCalled();
  });

  it('debe responder 504 si ocurre timeout y no se enviaron headers', () => {
    timeoutMiddleware(
      req as Request,
      res as unknown as Response,
      next as NextFunction,
    );

    timeoutCallback?.();

    expect(res.status).toHaveBeenCalledWith(504);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Gateway Timeout',
    });
  });

  it('no debe responder si headers ya fueron enviados', () => {
    res.headersSent = true;

    timeoutMiddleware(
      req as Request,
      res as unknown as Response,
      next as NextFunction,
    );

    timeoutCallback?.();

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  
});