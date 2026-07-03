/**
 * @remarks Barrel del módulo de errores: la excepción base
 * {@link BaseException}, el catálogo {@link ErrorCode} y las utilidades de
 * mapeo hacia/desde HTTP status codes ({@link HttpErrorMapper},
 * {@link getErrorCodeFromHttpStatus}).
 */
export * from './BaseException';
export * from './ErrorCode.enum';
export * from './HttpError.mapper';
