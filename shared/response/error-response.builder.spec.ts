import { ErrorCode } from '../errors';

import { errorResponse } from './error-response.builder';

describe('errorResponse', () => {
  it('debe construir una respuesta de error básica', () => {
    const error = 'Something went wrong';

    const result = errorResponse(error);

    expect(result).toEqual({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: error,
      },
    });
  });

  it('debe aceptar objetos como error', () => {
    const error = {
      code: 'AUTH_FAILED',
      message: 'Invalid credentials',
    };

    const result = errorResponse(error);

    expect(result.success).toBe(false);
    expect(result.error).toEqual(error);
  });

  it('debe aceptar instancias de Error', () => {
    const error = new Error('Boom');

    const result = errorResponse(error);

    expect(result.success).toBe(false);
    expect(result.error).toEqual({
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Boom',
    });
  });

  it('debe incluir meta y detalles cuando se proporcionan', () => {
    const result = errorResponse(
      {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Datos inválidos',
      },
      {
        details: ['email is required'],
        meta: {
          path: '/v1/auth/register',
          statusCode: 400,
        },
      },
    );

    expect(result).toEqual({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Datos inválidos',
        details: ['email is required'],
      },
      meta: {
        path: '/v1/auth/register',
        statusCode: 400,
      },
    });
  });
});
