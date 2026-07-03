/**
 * Puerto de caché para valores de configuración frecuentemente leídos.
 *
 * @remarks
 * Implementado sobre Redis (`RedisConfigCacheService`). Las claves lógicas
 * que recibe este puerto no incluyen el namespace del servicio: lo agrega
 * la implementación concreta.
 */
export interface ConfigCache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  /** Elimina todas las claves que coincidan con un patrón estilo Redis (`KEYS`). */
  flush(pattern: string): Promise<void>;
}
