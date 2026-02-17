/**
 * Servicio de generación de tokens
 */
export interface TokenService {
  generateAccessToken(payload: {
    userId: string;
    sessionId: string;
  }): string;

  generateRefreshToken(): {
    token: string;
    expiresAt: Date;
  };
}
