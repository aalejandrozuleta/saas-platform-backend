/**
 * @remarks Barrel del módulo de logging: contrato {@link PlatformLogger},
 * tipos de configuración, la implementación basada en Pino
 * ({@link PinoLoggerAdapter}, {@link createPinoConfig}), el token de
 * inyección {@link PLATFORM_LOGGER}, su provider ({@link LoggerProvider})
 * y el interceptor HTTP que establece el contexto de request y loguea cada
 * request/response ({@link HttpRequestLoggingInterceptor}).
 */
export * from './logger.interface';
export * from './logger.types';
export * from './pino.config';
export * from './logger.token';
export * from './logger.provider';
export * from './http-request-logging.interceptor';
