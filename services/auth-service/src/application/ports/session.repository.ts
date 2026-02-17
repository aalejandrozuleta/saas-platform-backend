/**
 * Puerto de persistencia de sesiones
 */
export interface SessionRepository {
  create(params: {
    userId: string;
    deviceId?: string;
    ipAddress: string;
    country?: string;
  }): Promise<{ id: string }>;

  revoke(sessionId: string): Promise<void>;
}
