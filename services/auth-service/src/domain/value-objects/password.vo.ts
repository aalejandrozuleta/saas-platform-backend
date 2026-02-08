/**
 * Value Object Password
 * Valida fuerza de contraseña
 */
export class PasswordVO {
  private constructor(private readonly value: string) {}

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
