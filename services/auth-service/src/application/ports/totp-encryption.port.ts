/**
 * Puerto para cifrar/descifrar el secreto TOTP antes de persistirlo.
 *
 * @remarks
 * El secret TOTP es equivalente en sensibilidad a una contraseña compartida:
 * quien lo obtenga puede generar códigos válidos indefinidamente. A
 * diferencia de una contraseña, no puede almacenarse solo como hash porque
 * el servidor necesita el valor en texto plano para verificar códigos, por
 * lo que se cifra en reposo (en vez de hashearse) y se descifra solo al
 * momento de validar un token.
 */
export interface TotpEncryptionPort {
  /**
   * Cifra el secreto TOTP en texto plano para su almacenamiento.
   *
   * @param plaintext - Secreto TOTP en base32 sin cifrar.
   * @returns El secreto cifrado, listo para persistir.
   */
  encrypt(plaintext: string): string;

  /**
   * Descifra el secreto TOTP previamente almacenado.
   *
   * @param ciphertext - Secreto TOTP cifrado tal como se guardó.
   * @returns El secreto en texto plano, listo para verificar un token.
   */
  decrypt(ciphertext: string): string;
}
