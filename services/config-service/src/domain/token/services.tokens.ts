/**
 * Tokens de inyección de dependencias (DI) para servicios del dominio
 * cuya implementación concreta vive en la capa de infraestructura
 * (ver `config.providers.ts`).
 */

/** Token del servicio de cache de configuración (implementado sobre Redis). */
export const CONFIG_CACHE = Symbol('CONFIG_CACHE');
/** Token del logger de auditoría (implementado sobre Mongo). */
export const AUDIT_LOGGER = Symbol('AUDIT_LOGGER');
/** Token del servicio de estadísticas del sistema (implementado sobre Prisma). */
export const STATS_SERVICE = Symbol('STATS_SERVICE');
