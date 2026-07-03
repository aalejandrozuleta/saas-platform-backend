import type { FeatureFlag } from '@domain/entities/feature-flag/feature-flag.entity';

/**
 * Filtros opcionales para listar feature flags.
 */
export interface FeatureFlagFilter {
  /** Filtra por entorno (`development`, `staging`, `production`, etc.). `null` busca flags globales. */
  environment?: string | null;
  /** Filtra por flags activos (`true`) o inactivos (`false`). */
  enabled?: boolean;
}

/**
 * Contrato de persistencia para feature flags.
 * La capa de aplicación depende de esta interfaz, no de la implementación
 * concreta (Prisma), siguiendo el patrón de puertos y adaptadores.
 */
export interface FeatureFlagRepository {
  /** Busca un flag por su clave única, opcionalmente acotado a un entorno. */
  findByKey(key: string, environment?: string | null): Promise<FeatureFlag | null>;
  /** Lista los flags que cumplen el filtro dado (o todos si no se pasa filtro). */
  findAll(filter?: FeatureFlagFilter): Promise<FeatureFlag[]>;
  /** Crea o actualiza (upsert) un flag. */
  save(flag: FeatureFlag): Promise<FeatureFlag>;
  /** Elimina un flag por su ID. */
  delete(id: string): Promise<void>;
}
