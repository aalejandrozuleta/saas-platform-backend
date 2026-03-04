import { BaseException, ErrorCode } from '@saas/shared';

import { AuthServiceUnavailableException } from './auth-service.exception';

describe('AuthServiceUnavailableException', () => {
  it('debe crear correctamente la excepción', () => {
    const error = new AuthServiceUnavailableException();

    expect(error).toBeInstanceOf(AuthServiceUnavailableException);
    expect(error).toBeInstanceOf(BaseException);

    expect(error.message).toBe('Auth service unavailable');
  });

  it('debe tener el código de error correcto', () => {
    const error = new AuthServiceUnavailableException();

    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
  });

  it('debe tener el status HTTP correcto', () => {
    const error = new AuthServiceUnavailableException();

    expect(error.httpStatus).toBe(503);
  });

  it('debe aceptar metadata opcional', () => {
    const metadata = {
      service: 'auth-service',
      timeout: true,
    };

    const error = new AuthServiceUnavailableException(metadata);

    expect(error.metadata).toEqual(metadata);
  });
});