/**
 * Servicio de generación de tokens.
 */
export interface TokenService {

  /**
   * Genera access token.
   */
  generateAccessToken(payload: {
    userId: string;
    sessionId: string;
  }): string;

  /**
   * Genera refresh token con identificador único (jti).
   */
  generateRefreshToken(): {
    token: string;
    jti: string;
    expiresAt: Date;
  };
}
