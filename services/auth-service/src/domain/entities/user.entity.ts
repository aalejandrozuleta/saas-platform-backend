import { EmailVO } from '../value-objects/email.vo';
import { UserStatus } from '../enums/user-status.enum';

/**
 * Entidad de dominio Usuario
 */
export class User {
  protected constructor(
    readonly id: string,
    readonly email: EmailVO,
    readonly passwordHash: string,
    readonly status: UserStatus,
    readonly createdAt: Date,
  ) {}

  /**
   * Fábrica para crear un usuario nuevo (REGISTER)
   */
  static create(params: {
    id: string;
    email: EmailVO;
    passwordHash: string;
  }): User {
    return new User(
      params.id,
      params.email,
      params.passwordHash,
      UserStatus.ACTIVE,
      new Date(),
    );
  }

  /**
   * Reconstrucción desde persistencia
   */
  static fromPersistence(params: {
    id: string;
    email: EmailVO;
    passwordHash: string;
    status: UserStatus;
    createdAt: Date;
  }): User {
    return new User(
      params.id,
      params.email,
      params.passwordHash,
      params.status,
      params.createdAt,
    );
  }
}
