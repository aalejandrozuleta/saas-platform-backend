/**
 * Datos generados al aprovisionar TOTP para un usuario.
 */
export interface TotpSetup {
  /** Secreto TOTP en base32, en texto plano (aún no cifrado). */
  secret: string;
  /** URL `otpauth://` estándar, codificable como QR para apps autenticadoras. */
  otpauthUrl: string;
  /** Código QR de `otpauthUrl` ya renderizado como data URL, listo para mostrar en el cliente. */
  qrCode: string;
}

/**
 * Puerto para generación y verificación de códigos TOTP (RFC 6238),
 * usado como segundo factor de autenticación.
 *
 * @remarks
 * La implementación concreta ({@link TotpServiceImpl}) no conoce persistencia:
 * este puerto solo se ocupa de la criptografía de TOTP, dejando el
 * almacenamiento del secret cifrado a {@link TotpEncryptionPort} y al
 * repositorio de usuario/perfil de seguridad correspondiente.
 */
export interface TotpService {
  /**
   * Genera un nuevo secreto TOTP y su material de aprovisionamiento (QR).
   *
   * @param accountName - Identificador legible del usuario (normalmente su email).
   * @param issuer - Nombre del emisor mostrado en la app autenticadora.
   */
  generateSecret(accountName: string, issuer?: string): Promise<TotpSetup>;

  /**
   * Verifica si un código de 6 dígitos es válido para el secret dado.
   *
   * @param token - Código ingresado por el usuario.
   * @param secret - Secreto TOTP en texto plano (ya descifrado) del usuario.
   * @returns `true` si el token es válido dentro de la ventana de tolerancia.
   */
  verifyToken(token: string, secret: string): boolean;
}
