/**
 * Puerto de persistencia para los recovery codes (códigos de un solo uso
 * que permiten superar el login challenge si el usuario pierde acceso a su
 * segundo factor).
 */
export interface RecoveryCodeRepository {
  /**
   * Guarda un nuevo lote de recovery codes para el usuario.
   *
   * @remarks
   * Recibe los códigos ya hasheados (`codeHashes`), nunca en texto plano:
   * al igual que las contraseñas, un recovery code solo debe existir en
   * claro en el momento en que se genera y se muestra al usuario.
   *
   * @param userId - Identificador del usuario dueño de los códigos.
   * @param codeHashes - Hashes de los recovery codes a persistir.
   */
  createMany(userId: string, codeHashes: string[]): Promise<void>;

  /**
   * Elimina todos los recovery codes existentes de un usuario.
   *
   * @remarks
   * Se usa antes de generar un nuevo lote (para invalidar los anteriores)
   * y al deshabilitar 2FA, evitando que códigos viejos sigan siendo válidos.
   *
   * @param userId - Identificador del usuario cuyos códigos se eliminan.
   */
  deleteAllByUser(userId: string): Promise<void>;

  /**
   * Devuelve los recovery codes sin usar de un usuario (id + hash), para
   * que el caso de uso los compare uno a uno contra el código recibido.
   *
   * @param userId - Identificador del usuario dueño de los códigos.
   */
  findUnusedByUser(userId: string): Promise<Array<{ id: string; codeHash: string }>>;

  /**
   * Marca un recovery code como usado (invariante de un solo uso).
   *
   * @param id - Identificador del recovery code consumido.
   */
  markUsed(id: string): Promise<void>;
}
