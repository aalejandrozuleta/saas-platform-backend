/**
 * Tokens de inyección de dependencias (DI) de NestJS para servicios de
 * infraestructura. Se usan con `@Inject(...)` para resolver la
 * implementación concreta de cada puerto/interfaz.
 */
export const AUTH_SERVICE_CLIENT = Symbol('AUTH_SERVICE_CLIENT');
