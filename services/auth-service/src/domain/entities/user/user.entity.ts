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
      lockoutCount: 0,
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

  get lockoutCount(): number {
    return this.props.lockoutCount;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  // ===== Reglas de dominio =====

  isBlocked(): boolean {
    return (
      this.props.blockedUntil !== undefined &&
      this.props.blockedUntil > new Date()
    );
  }

  increaseFailedAttempts(): User {
    return new User({
      ...this.props,
      failedLoginAttempts: this.props.failedLoginAttempts + 1,
    });
  }

  resetFailedAttempts(): User {
    return new User({
      ...this.props,
      failedLoginAttempts: 0,
      blockedUntil: undefined,
    });
  }

  hasExpiredTemporaryBlock(now: Date): boolean {
    return (
      this.props.blockedUntil !== undefined &&
      this.props.blockedUntil <= now
    );
  }

  /**
   * Libera bloqueo temporal. lockoutCount se preserva intencionalmente
   * para que el siguiente bloqueo use la duración progresiva correcta.
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
