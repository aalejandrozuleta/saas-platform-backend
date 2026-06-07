/** Puerto de caché para valores de configuración frecuentemente leídos. */
export interface ConfigCache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(pattern: string): Promise<void>;
}
