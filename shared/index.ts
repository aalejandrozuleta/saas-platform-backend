/**
 * Punto de entrada del paquete `@saas/shared`. Reexporta todos los
 * módulos que los cuatro microservicios consumen como contrato común:
 *
 * - `logger`          — logger de plataforma y su interceptor de logging HTTP.
 * - `context`         — utilidades de contexto de request (correlation id, etc).
 * - `errors`          — jerarquía de excepciones de dominio/HTTP compartidas.
 * - `response`        — builders para estandarizar las respuestas HTTP.
 * - `i18n`            — servicio de internacionalización y carga de mensajes.
 * - `activity-report` — subsistema de auditoría/actividad respaldado por Mongo.
 * - `shared.module`   — módulo raíz que wirea logger e interceptor globales.
 * - `filters`         — exception filters globales de NestJS.
 * - `swagger`         — configuración y setup común de Swagger/OpenAPI.
 * - `redis`           — módulo y tipos para el cliente Redis compartido.
 * - `decorators`      — decoradores comunes (rutas públicas, roles, permisos).
 * - `metrics`         — servicio base de métricas Prometheus.
 * - `permissions`     — catálogo de permisos y mapa de permisos por rol.
 */
export * from './logger';
export * from './context';
export * from './errors';
export * from './response';
export * from './i18n';
export * from './activity-report';
export * from './shared.module';
export * from './filters';
export * from './swagger';
export * from './redis';
export * from './decorators';
export * from './metrics';
export * from './permissions';
