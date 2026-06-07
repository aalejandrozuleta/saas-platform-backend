/**
 * Value Object Password
 * Valida fuerza de contraseña
 */
export class PasswordVO {
  private constructor(private readonly value: string) {}

  /**
   * Crea una instancia validada del PasswordVO.
   *
   * @remarks
   * Requisitos: mínimo 12 caracteres, al menos una minúscula, una mayúscula,
   * un dígito y un carácter especial.
   *
   * @throws `Error('INVALID_PASSWORD')` si no cumple los requisitos.
   */
  static create(password: string): PasswordVO {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;

    if (!regex.test(password)) {
      throw new Error('INVALID_PASSWORD');
    }

    return new PasswordVO(password);
  }

  getValue(): string {
    return this.value;
  }
}
