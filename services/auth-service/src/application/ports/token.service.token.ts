import { type UserRole } from '@domain/enums/user-role.enum';

/**
 * Servicio de generación de tokens.
 */
export interface TokenService {
  /**
   * Genera access token.
   */
  generateAccessToken(payload: { userId: string; sessionId: string; role: UserRole }): string;

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

  /**
   * Genera un token de challenge de MFA de corta duración (`MFA_CHALLENGE_TTL`),
   * emitido cuando el login exige verificación adicional (2FA, dispositivo o
   * país no confiable). El cliente lo reenvía junto al código TOTP o
   * recovery code para completar el login sin repetir la contraseña.
   */
  generateChallengeToken(payload: {
    userId: string;
    deviceFingerprint?: string;
    country?: string;
    reason: string;
  }): string;

  /**
   * Verifica un challenge token de MFA.
   *
   * @throws si el token es inválido, expiró, o no fue emitido con el
   * propósito de challenge de MFA (protege contra reutilizar un access
   * token o refresh token como si fuera un challenge token).
   */
  verifyChallengeToken(token: string): {
    userId: string;
    deviceFingerprint?: string;
    country?: string;
    reason: string;
  };
}
