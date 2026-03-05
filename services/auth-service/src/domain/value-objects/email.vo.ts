/**
 * Value Object Email
 * Garantiza que el email tenga un formato válido
 * y protege contra ataques ReDoS limitando longitud.
 */
export class EmailVO {
  /**
   * Longitud máxima definida por RFC 5321
   */
  private static readonly MAX_LENGTH = 254;

  /**
   * Regex segura para validación básica de email.
   * Evita clases demasiado amplias que generen backtracking.
   */
  private static readonly EMAIL_REGEX =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  private constructor(private readonly value: string) {}

  /**
   * Crea una instancia validada del EmailVO
   *
   * @param email - Email en formato string
   * @returns EmailVO
   */
  static create(email: string): EmailVO {
    const normalized = email.trim().toLowerCase();

    /**
     * Protección contra ataques de ReDoS
     */
    if (normalized.length === 0 || normalized.length > EmailVO.MAX_LENGTH) {
      throw new Error('INVALID_EMAIL');
    }

    if (!EmailVO.EMAIL_REGEX.test(normalized)) {
      throw new Error('INVALID_EMAIL');
    }

    return new EmailVO(normalized);
  }

  /**
   * Devuelve el valor del email
   */
  getValue(): string {
    return this.value;
  }
}