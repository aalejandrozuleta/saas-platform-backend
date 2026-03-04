import { BaseException } from './BaseException';
import { ErrorCode } from './ErrorCode.enum';

/**
 * Implementación concreta para pruebas.
 */
class TestException extends BaseException {
  constructor(metadata?: Record<string, unknown>) {
    super(
      'test.error',
      ErrorCode.INTERNAL_ERROR,
      500,
      metadata,
    );
  }
}

describe('BaseException', () => {
  it('debe extender Error', () => {
    const error = new TestException();

    expect(error).toBeInstanceOf(Error);
  });

  it('debe asignar correctamente las propiedades', () => {
    const metadata = { userId: '123' };

    const error = new TestException(metadata);

    expect(error.message).toBe('test.error');
    expect(error.messageKey).toBe('test.error');
    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(error.httpStatus).toBe(500);
    expect(error.metadata).toEqual(metadata);
  });

  it('debe permitir metadata opcional', () => {
    const error = new TestException();

    expect(error.metadata).toBeUndefined();
  });
});