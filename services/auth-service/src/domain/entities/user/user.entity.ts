import { type EmailVO } from '@domain/value-objects/email.vo';
import { UserStatus } from '@domain/enums/user-status.enum';

import { type UserProps } from './user.props';

/**
 * Entidad de dominio Usuario
 */
export class User {
  private constructor(private readonly props: UserProps) {}

  /**
   * Fábrica para registro de usuario nuevo
   */
  static create(params: {
    id: string;
    email: EmailVO;
    passwordHash: string;
  }): User {
    return new User({
      id: params.id,
      email: params.email,
      passwordHash: params.passwordHash,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      failedLoginAttempts: 0,
      createdAt: new Date(),
    });
  }

  /**
   * Reconstrucción desde persistencia
   */
  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  // ===== Getters =====

  get id(): string {
    return this.props.id;
  }

  get email(): EmailVO {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get failedLoginAttempts(): number {
    return this.props.failedLoginAttempts;
  }

  get blockedUntil(): Date | undefined {
    return this.props.blockedUntil;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // ===== Reglas de dominio =====

  /**
   * Indica si el usuario está bloqueado actualmente
   */
  isBlocked(): boolean {
    return (
      this.props.blockedUntil !== undefined &&
      this.props.blockedUntil > new Date()
    );
  }

  /**
   * Incrementa intentos fallidos
   */
  increaseFailedAttempts(): User {
    return new User({
      ...this.props,
      failedLoginAttempts: this.props.failedLoginAttempts + 1,
    });
  }

  /**
   * Resetea intentos fallidos
   */
  resetFailedAttempts(): User {
    return new User({
      ...this.props,
      failedLoginAttempts: 0,
      blockedUntil: undefined,
    });
  }

  /**
   * Indica si un bloqueo temporal ya expiró.
   */
  hasExpiredTemporaryBlock(now: Date): boolean {
    return (
      this.props.blockedUntil !== undefined &&
      this.props.blockedUntil <= now
    );
  }

  /**
   * Libera un bloqueo temporal heredado y restaura el acceso.
   */
  releaseTemporaryBlock(): User {
    return new User({
      ...this.props,
      status: UserStatus.ACTIVE,
      failedLoginAttempts: 0,
      blockedUntil: undefined,
    });
  }
}
