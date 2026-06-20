import { ErrorCode } from './ErrorCode.enum';
import {
  HttpErrorMapper,
  getErrorCodeFromHttpStatus,
} from './HttpError.mapper';

describe('HttpErrorMapper', () => {
  it('debe mapear INTERNAL_ERROR a 500', () => {
    expect(HttpErrorMapper[ErrorCode.INTERNAL_ERROR]).toBe(500);
  });

  it('debe mapear UNAUTHORIZED a 401', () => {
    expect(HttpErrorMapper[ErrorCode.UNAUTHORIZED]).toBe(401);
  });

  it('debe mapear NOT_FOUND a 404', () => {
    expect(HttpErrorMapper[ErrorCode.NOT_FOUND]).toBe(404);
  });

  it('debe mapear SERVICE_UNAVAILABLE a 503', () => {
    expect(HttpErrorMapper[ErrorCode.SERVICE_UNAVAILABLE]).toBe(503);
  });

  it('debe contener todos los ErrorCodes definidos', () => {
    const allCodes = Object.values(ErrorCode);
    for (const code of allCodes) {
      expect(HttpErrorMapper).toHaveProperty(code);
    }
  });
});

describe('getErrorCodeFromHttpStatus', () => {
  const cases: Array<[number, ErrorCode]> = [
    [400, ErrorCode.VALIDATION_ERROR],
    [401, ErrorCode.UNAUTHORIZED],
    [403, ErrorCode.FORBIDDEN],
    [404, ErrorCode.NOT_FOUND],
    [405, ErrorCode.METHOD_NOT_ALLOWED],
    [409, ErrorCode.CONFLICT],
    [422, ErrorCode.VALIDATION_ERROR],
    [415, ErrorCode.UNSUPPORTED_MEDIA_TYPE],
    [429, ErrorCode.TOO_MANY_REQUESTS],
    [502, ErrorCode.BAD_GATEWAY],
    [503, ErrorCode.SERVICE_UNAVAILABLE],
    [504, ErrorCode.GATEWAY_TIMEOUT],
  ];

  test.each(cases)(
    'HTTP %i → %s',
    (status, expected) => {
      expect(getErrorCodeFromHttpStatus(status)).toBe(expected);
    },
  );

  it('debe retornar INTERNAL_ERROR para status desconocido', () => {
    expect(getErrorCodeFromHttpStatus(418)).toBe(ErrorCode.INTERNAL_ERROR);
    expect(getErrorCodeFromHttpStatus(0)).toBe(ErrorCode.INTERNAL_ERROR);
  });
});
