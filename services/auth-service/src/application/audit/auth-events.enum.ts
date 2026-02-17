/**
 * Eventos de auditoría relacionados con autenticación.
 *
 * Estos eventos representan acciones de seguridad
 * dentro del flujo de login y registro.
 *
 * ⚠ No contienen lógica.
 * ⚠ Son parte del contrato de auditoría.
 */
export enum AuthAuditEvent {
  /**
   * Se inició un intento de login.
   */
  LOGIN_ATTEMPT = 'AUTH.LOGIN_ATTEMPT',

  /**
   * Login fallido genérico.
   */
  LOGIN_FAILED = 'AUTH.LOGIN_FAILED',

  /**
   * Login fallido porque el email no existe.
   */
  LOGIN_FAILED_EMAIL_NOT_FOUND = 'AUTH.LOGIN_FAILED_EMAIL_NOT_FOUND',

  /**
   * Login fallido por contraseña incorrecta.
   */
  LOGIN_FAILED_INVALID_PASSWORD = 'AUTH.LOGIN_FAILED_INVALID_PASSWORD',

  /**
   * Login bloqueado por demasiados intentos.
   */
  LOGIN_BLOCKED = 'AUTH.LOGIN_BLOCKED',

  /**
   * Login exitoso.
   */
  LOGIN_SUCCESS = 'AUTH.LOGIN_SUCCESS',

  /**
   * Login desde dispositivo no confiable.
   */
  LOGIN_DEVICE_NOT_TRUSTED = 'AUTH.LOGIN_DEVICE_NOT_TRUSTED',

  /**
   * Login desde país no confiable.
   */
  LOGIN_COUNTRY_NOT_TRUSTED = 'AUTH.LOGIN_COUNTRY_NOT_TRUSTED',

  /**
   * Registro de usuario exitoso.
   */
  REGISTER_SUCCESS = 'AUTH.REGISTER_SUCCESS',

  /**
   * Registro fallido.
   */
  REGISTER_FAILED = 'AUTH.REGISTER_FAILED',

  /**
   * Activación de 2FA.
   */
  TWO_FACTOR_ENABLED = 'AUTH.TWO_FACTOR_ENABLED',

  /**
   * Desactivación de 2FA.
   */
  TWO_FACTOR_DISABLED = 'AUTH.TWO_FACTOR_DISABLED',

  /**
   * Verificación 2FA exitosa.
   */
  TWO_FACTOR_SUCCESS = 'AUTH.TWO_FACTOR_SUCCESS',

  /**
   * Verificación 2FA fallida.
   */
  TWO_FACTOR_FAILED = 'AUTH.TWO_FACTOR_FAILED',
}
