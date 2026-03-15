import { successResponse } from './success-response.builder';

describe('successResponse', () => {
  it('debe construir una respuesta exitosa básica', () => {
    const data = { id: 1 };

    const result = successResponse(data);

    expect(result).toEqual({
      success: true,
      data,
    });
  });

  it('debe aceptar arrays', () => {
    const data = [1, 2, 3];

    const result = successResponse(data);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
  });

  it('debe aceptar tipos primitivos', () => {
    const result = successResponse('ok');

    expect(result).toEqual({
      success: true,
      data: 'ok',
    });
  });

  it('debe incluir mensaje y metadata cuando se proporcionan', () => {
    const result = successResponse(
      { id: 1 },
      {
        message: 'Operación completada',
        meta: {
          requestId: 'req-123',
          statusCode: 201,
        },
      },
    );

    expect(result).toEqual({
      success: true,
      message: 'Operación completada',
      data: { id: 1 },
      meta: {
        requestId: 'req-123',
        statusCode: 201,
      },
    });
  });
});
