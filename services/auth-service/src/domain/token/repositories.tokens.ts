/**
 * Tokens de inyección de dependencias (DI) de NestJS para los
 * repositorios del dominio. Se usan con `@Inject(...)` para resolver
 * la implementación concreta (Prisma, etc.) de cada interfaz de
 * repositorio.
 */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
export const DEVICE_REPOSITORY = Symbol('DEVICE_REPOSITORY');
export const SECURITY_REPOSITORY = Symbol('SECURITY_REPOSITORY');
export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');
export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');
export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');
export const RECOVERY_CODE_REPOSITORY = Symbol('RECOVERY_CODE_REPOSITORY');
