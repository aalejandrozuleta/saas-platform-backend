/**
 * Puerto de persistencia de refresh tokens
 */
export interface RefreshTokenRepository {
  create(params: {
    userId: string;
    sessionId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;

  revokeBySession(sessionId: string): Promise<void>;
}
