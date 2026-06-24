import { UserRole } from '@domain/enums/user-role.enum';

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
    role: UserRole;
  }): string;

  /**
   * Genera refresh token con identificador único (jti).
   */
  generateRefreshToken(): {
    token: string;
    jti: string;
    expiresAt: Date;
  };

  /**
 * Verifica refresh token.
 */
  verifyRefreshToken(token: string): { jti: string };
}
