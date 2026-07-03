/**
 * Puerto (interfaz) que expone el registro de auditoría a la capa de
 * aplicación de auth-service.
 *
 * @remarks
 * Es un re-export tipado de `ActivityReporter` (definido en `@saas/shared`)
 * bajo el nombre `AuditLogger`. Se mantiene este alias local para que el
 * dominio/aplicación de auth-service dependa de un puerto propio (siguiendo
 * el patrón puertos-y-adaptadores) en vez de acoplarse directamente al tipo
 * del paquete compartido; la implementación concreta se inyecta vía el token
 * `AUDIT_LOGGER` y actualmente resuelve a {@link AuthActivityRecorderService}.
 */
export type { ActivityReporter as AuditLogger } from '@saas/shared';
