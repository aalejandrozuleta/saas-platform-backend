import { HttpException, HttpStatus, type ArgumentsHost } from '@nestjs/common';
import type { Request, Response } from 'express';

import { BaseException, ErrorCode } from '../errors';
import { type I18nService } from '../i18n';

import { GlobalExceptionFilter } from './global-exception.filter';


/**
 * Implementación concreta para test
 */
class TestDomainException extends BaseException {
  constructor() {
    super('auth.invalid_credentials', ErrorCode.INTERNAL_ERROR, 400);
  }
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let i18n: jest.Mocked<I18nService>;

  let response: Partial<Response>;
  let request: Partial<Request>;
  let host: ArgumentsHost;

  beforeEach(() => {
    i18n = {
      translate: jest.fn().mockReturnValue('translated message'),
      resolveLanguage: jest.fn().mockReturnValue('es'),
    } as any;

    filter = new GlobalExceptionFilter(i18n);

    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    request = {
      url: '/test',
      headers: {
        'accept-language': 'es-CL,es;q=0.9',
      },
    };

    host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;
  });

  it('debe manejar BaseException', () => {
    const exception = new TestDomainException();

    filter.catch(exception, host);

    expect(i18n.translate).toHaveBeenCalledWith(
      'auth.invalid_credentials',
      'es-CL,es;q=0.9',
      undefined,
    );

    expect(response.status).toHaveBeenCalledWith(400);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.INTERNAL_ERROR,
          message: 'translated message',
        }),
        meta: expect.objectContaining({
          path: '/test',
          statusCode: 400,
          lang: 'es',
        }),
      }),
    );
  });

  it('debe manejar HttpException', () => {
    const exception = new HttpException(
      { message: 'Bad request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(400);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Bad request',
        },
        meta: expect.objectContaining({
          statusCode: 400,
        }),
      }),
    );
  });

  it('debe manejar errores desconocidos', () => {
    const exception = new Error('unexpected');

    filter.catch(exception, host);

    expect(i18n.translate).toHaveBeenCalledWith(
      'common.internal_error',
      'es-CL,es;q=0.9',
    );

    expect(response.status).toHaveBeenCalledWith(500);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.INTERNAL_ERROR,
          message: 'translated message',
        }),
        meta: expect.objectContaining({
          statusCode: 500,
          lang: 'es',
        }),
      }),
    );
  });

  it('debe exponer detalles de validación cuando HttpException trae un arreglo de mensajes', () => {
    const exception = new HttpException(
      {
        message: ['email should not be empty'],
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'translated message',
          details: ['email should not be empty'],
        }),
      }),
    );
  });
});
