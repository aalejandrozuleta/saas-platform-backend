/**
 * Value Object Email
 * Garantiza emails válidos en el dominio
 */
export class EmailVO {
  private constructor(private readonly value: string) {}

  static create(email: string): EmailVO {
    const normalized = email.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(normalized)) {
      throw new Error('INVALID_EMAIL');
    }

    return new EmailVO(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
