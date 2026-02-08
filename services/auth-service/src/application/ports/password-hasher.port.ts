/**
 * Puerto de dominio para hashing de contraseñas
 */
export interface PasswordHasher {
  /**
   * Genera el hash de una contraseña en texto plano
   */
  hash(password: string): Promise<string>;

  /**
   * Verifica una contraseña contra un hash
   */
  verify(hash: string, password: string): Promise<boolean>;
}
