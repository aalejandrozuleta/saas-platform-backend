export interface SessionData {
  userId:      string;
  role:        string;
  permissions: string[];
}

/**
 * Puerto para manejar cache de sesiones en Redis.
 */
export interface SessionCache {
  /**
   * Guarda una sesión activa en cache.
   * role y permissions se almacenan para que el gateway los lea sin DB.
   */
  storeSession(
    sessionId:   string,
    userId:      string,
    deviceId:    string | null,
    ttl:         number,
    role?:       string,
    permissions?: string[],
  ): Promise<void>;

  /**
   * Devuelve los datos de sesión o null si no existe / expiró.
   * Reemplaza a isSessionActive cuando se necesita el payload completo.
   */
  getSession(sessionId: string): Promise<SessionData | null>;

  /**
   * Verifica si la sesión existe y está activa (atajo rápido).
   */
  isSessionActive(sessionId: string): Promise<boolean>;

  /**
   * Revoca una sesión.
   */
  revokeSession(sessionId: string): Promise<void>;
}