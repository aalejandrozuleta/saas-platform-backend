/**
 * Motivo por el cual un login dispara un desafío de verificación adicional
 * (step-up auth) en vez de completarse directamente.
 */
export enum LoginChallengeReason {
  /** El usuario nunca había iniciado sesión desde este dispositivo/fingerprint. */
  NEW_DEVICE = 'NEW_DEVICE',
  /** El dispositivo fue visto antes pero no está marcado como confiable. */
  UNTRUSTED_DEVICE = 'UNTRUSTED_DEVICE',
  /** El intento proviene de un país fuera de la lista de países confiables del usuario. */
  UNTRUSTED_COUNTRY = 'UNTRUSTED_COUNTRY',
  /** El usuario tiene 2FA activado: se exige TOTP o recovery code en cada login. */
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',
}

/**
 * Tipos de método con los que un usuario puede superar un login challenge.
 */
export enum LoginVerificationMethodType {
  EMAIL = 'EMAIL',
  TOTP = 'TOTP',
  SMS = 'SMS',
  RECOVERY_CODE = 'RECOVERY_CODE',
}

/**
 * Describe un método de verificación disponible para el usuario dentro de
 * un login challenge, tal como se lo presenta al cliente.
 */
export interface LoginVerificationMethod {
  type: LoginVerificationMethodType;
  /** Indica si el método está listo para usarse (ej. 2FA ya configurado). */
  ready: boolean;
  /** Indica si este método debería ofrecerse como opción preferida en el cliente. */
  isRecommended: boolean;
  /** Destino enmascarado al que se envía el código (ej. email parcialmente oculto), si aplica. */
  destination?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Metadata adjunta al error de dominio `SECURITY_CHALLENGE_REQUIRED`.
 *
 * @remarks
 * Este shape es lo que consume el cliente para renderizar la pantalla de
 * verificación adicional: no requiere otra llamada al backend para saber
 * qué métodos ofrecer, ya que `availableMethods` viaja completo en la
 * respuesta de error.
 */
export interface LoginSecurityChallengeMetadata {
  challengeType: 'LOGIN_VERIFICATION';
  reason: LoginChallengeReason;
  requiredAction: 'COMPLETE_ADDITIONAL_VERIFICATION';
  userId?: string;
  email?: string;
  deviceFingerprint?: string;
  country?: string;
  availableMethods: LoginVerificationMethod[];
  /**
   * Token de un solo uso, de corta duración, que el cliente reenvía a
   * `POST /auth/login/verify-2fa` junto al TOTP o recovery code para
   * completar el login sin repetir la contraseña.
   */
  challengeToken: string;
}
