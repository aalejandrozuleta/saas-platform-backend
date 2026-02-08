import { PasswordHasher } from '@application/ports/password-hasher.port';
import * as argon2 from 'argon2';

/**
 * Servicio de hash de contraseñas
 * Implementación con Argon2id (recomendado por OWASP)
 */
export class PasswordHasherService implements PasswordHasher{
  /**
   * Genera un hash seguro para una contraseña
   * @param password Contraseña en texto plano
   */
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,        // iteraciones
      parallelism: 1,
    });
  }

  /**
   * Compara una contraseña con su hash
   * @param hash Hash almacenado
   * @param password Contraseña en texto plano
   */
  async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
