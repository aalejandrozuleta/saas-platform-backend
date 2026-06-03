import { HttpException, HttpStatus, type ArgumentsHost } from '@nestjs/common';
import type { Request, Response } from 'express';

import { BaseException, ErrorCode } from '../errors';
import { type I18nService } from '../i18n';

import { GlobalExceptionFilter } from './global-exception.filter';

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
      headers: { 'accept-language': 'es-CL,es;q=0.9' },
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

    expect(i18n.translate).toHaveBeenCalledWith('auth.invalid_credentials', 'es-CL,es;q=0.9', undefined);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: ErrorCode.INTERNAL_ERROR, message: 'translated message' }),
        meta: expect.objectContaining({ path: '/test', statusCode: 400, lang: 'es' }),
      }),
    );
  });

  it('debe manejar HttpException con body de objeto plano', () => {
    const exception = new HttpException({ message: 'Bad request' }, HttpStatus.BAD_REQUEST);
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: { code: ErrorCode.VALIDATION_ERROR, message: 'Bad request' },
        meta: expect.objectContaining({ statusCode: 400 }),
      }),
    );
  });

  it('debe manejar errores desconocidos con fallback 500', () => {
    const exception = new Error('unexpected');
    filter.catch(exception, host);

    expect(i18n.translate).toHaveBeenCalledWith('common.internal_error', 'es-CL,es;q=0.9');
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: ErrorCode.INTERNAL_ERROR, message: 'translated message' }),
        meta: expect.objectContaining({ statusCode: 500, lang: 'es' }),
      }),
    );
  });

  it('debe manejar HttpException con cuerpo de tipo isApiErrorResponse', () => {
    const apiBody = { success: false, error: { code: ErrorCode.NOT_FOUND, message: 'No existe' } };
    const exception = new HttpException(apiBody, HttpStatus.NOT_FOUND);
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: ErrorCode.NOT_FOUND }) }),
    );
  });

  it('debe manejar HttpException con cuerpo de cadena', () => {
    const exception = new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ message: 'Forbidden resource' }) }),
    );
  });

  it('debe manejar HttpException con cuerpo nulo/no-objeto', () => {
    const exception = new HttpException(null as any, HttpStatus.BAD_REQUEST);
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: ErrorCode.INTERNAL_ERROR }) }),
    );
  });

  it('debe manejar HttpException con messageKey y code string', () => {
    const exception = new HttpException(
      { messageKey: 'auth.invalid_credentials', code: 'INVALID_CREDENTIALS', details: { f: 'email' }, metadata: { attempt: 1 } },
      HttpStatus.UNAUTHORIZED,
    );
    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(i18n.translate).toHaveBeenCalledWith('auth.invalid_credentials', expect.any(String), expect.any(Object));
  });

  it('debe usar getErrorCodeFromHttpStatus cuando messageKey existe pero code no es string', () => {
    const exception = new HttpException(
      { messageKey: 'common.validation_error', code: 0 },
      HttpStatus.BAD_REQUEST,
    );
    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'VALIDATION_ERROR' }) }),
    );
  });

  it('debe manejar HttpException con error como string en el cuerpo', () => {
    const exception = new HttpException({ error: 'Unauthorized' }, HttpStatus.UNAUTHORIZED);
    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ message: 'Unauthorized' }) }),
    );
  });

  it('debe usar translate cuando rawMessage no es string ni array y error tampoco es string', () => {
    const exception = new HttpException({ message: { nested: true } }, HttpStatus.INTERNAL_SERVER_ERROR);
    filter.catch(exception, host);

    expect(i18n.translate).toHaveBeenCalledWith('common.internal_error', expect.anything());
  });

  it('debe exponer detalles cuando HttpException trae array de mensajes', () => {
    const exception = new HttpException({ message: ['email should not be empty'] }, HttpStatus.BAD_REQUEST);
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

  it('debe usar getErrorCodeFromHttpStatus cuando array message y code no es string', () => {
    const exception = new HttpException({ message: ['err1', 'err2'] }, HttpStatus.BAD_REQUEST);
    filter.catch(exception, host);

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'VALIDATION_ERROR' }) }),
    );
  });
});
