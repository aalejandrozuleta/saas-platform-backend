/**
 * Tokens de inyección de dependencias (DI) para los repositorios del dominio.
 * Se usan con `@Inject()` para desacoplar los consumidores de la
 * implementación concreta (ver `config.providers.ts`).
 */

/** Token del repositorio de feature flags (`FeatureFlagRepository`). */
export const FEATURE_FLAG_REPOSITORY = Symbol('FEATURE_FLAG_REPOSITORY');
/** Token del repositorio de ventanas de mantenimiento (`MaintenanceWindowRepository`). */
export const MAINTENANCE_WINDOW_REPOSITORY = Symbol('MAINTENANCE_WINDOW_REPOSITORY');
