/**
 * Puerto para manejar cache de sesiones en Redis.
 *
 * Redis actúa como acelerador de validación
 * para evitar consultas constantes a PostgreSQL.
 */
export interface SessionCache {
  /**
   * Guarda una sesión activa en cache.
   */
  storeSession(
    sessionId: string,
    userId: string,
    deviceId: string | null,
    ttl: number,
  ): Promise<void>;

  /**
   * Verifica si la sesión existe y está activa.
   */
  isSessionActive(sessionId: string): Promise<boolean>;

  /**
   * Revoca una sesión.
   */
  revokeSession(sessionId: string): Promise<void>;
}