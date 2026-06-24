/**
 * Puerto para manejar cache de sesiones en Redis.
 *
 * Redis actúa como acelerador de validación
 * para evitar consultas constantes a PostgreSQL.
 */
export interface SessionCache {
  /**
   * Guarda una sesión activa en cache junto a los permisos efectivos del usuario.
   * Los permisos se guardan en el valor de Redis para que el gateway los lea sin
   * necesitar una consulta adicional a la BD en cada request.
   */
  storeSession(
    sessionId: string,
    userId: string,
    deviceId: string | null,
    ttl: number,
    permissions?: string[],
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