import type { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@saas/shared';

import { timeoutMiddleware } from './timeout.middleware';

describe('timeoutMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  let timeoutCallback: (() => void) | undefined;

  beforeEach(() => {
    req = {
      url: '/auth/login',
      headers: {
        'accept-language': 'es',
      },
    };

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
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.GATEWAY_TIMEOUT,
          message:
            'El gateway agotó el tiempo de espera al procesar la solicitud',
        }),
        meta: expect.objectContaining({
          path: '/auth/login',
          statusCode: 504,
          lang: 'es',
        }),
      }),
    );
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
