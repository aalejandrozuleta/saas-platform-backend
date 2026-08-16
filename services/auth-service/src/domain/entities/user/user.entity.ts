import { type EmailVO } from '@domain/value-objects/email.vo';
import { UserRole } from '@domain/enums/user-role.enum';
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
    role?: UserRole;
    status?: UserStatus;
    emailVerified?: boolean;
    emailVerificationToken?: string;
    emailVerificationExpiresAt?: Date;
    mustChangePassword?: boolean;
  }): User {
    return new User({
      id: params.id,
      email: params.email,
      passwordHash: params.passwordHash,
      role: params.role ?? UserRole.CUSTOMER,
      status: params.status ?? UserStatus.PENDING,
      emailVerified: params.emailVerified ?? false,
      emailVerificationToken: params.emailVerificationToken,
      emailVerificationExpiresAt: params.emailVerificationExpiresAt,
      failedLoginAttempts: 0,
      lockoutCount: 0,
      mustChangePassword: params.mustChangePassword ?? false,
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

  get role(): UserRole {
    return this.props.role;
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

  get emailVerificationToken(): string | undefined {
    return this.props.emailVerificationToken;
  }

  get emailVerificationExpiresAt(): Date | undefined {
    return this.props.emailVerificationExpiresAt;
  }

  get passwordResetToken(): string | undefined {
    return this.props.passwordResetToken;
  }

  get passwordResetExpiresAt(): Date | undefined {
    return this.props.passwordResetExpiresAt;
  }

  get mustChangePassword(): boolean {
    return this.props.mustChangePassword;
  }

  // ===== Reglas de dominio =====

  /**
   * Indica si la cuenta está actualmente bajo bloqueo temporal
   * (por intentos fallidos de login).
   */
  isBlocked(): boolean {
    return this.props.blockedUntil !== undefined && this.props.blockedUntil > new Date();
  }

  /**
   * Incrementa el contador de intentos fallidos de login.
   *
   * @remarks
   * No aplica el bloqueo por sí sola: esa decisión la toma `LoginPolicy`
   * (`shouldLockAccount`) en base al nuevo valor de `failedLoginAttempts`.
   */
  increaseFailedAttempts(): User {
    return new User({
      ...this.props,
      failedLoginAttempts: this.props.failedLoginAttempts + 1,
    });
  }

  /**
   * Resetea intentos fallidos y limpia cualquier bloqueo temporal.
   * Se invoca tras un login exitoso.
   */
  resetFailedAttempts(): User {
    return new User({
      ...this.props,
      failedLoginAttempts: 0,
      blockedUntil: undefined,
    });
  }

  /**
   * Indica si el bloqueo temporal ya venció respecto a `now`,
   * aunque el registro persistido todavía no lo refleje.
   */
  hasExpiredTemporaryBlock(now: Date): boolean {
    return this.props.blockedUntil !== undefined && this.props.blockedUntil <= now;
  }

  /**
   * Asigna un nuevo token de verificación de email con su expiración.
   * Usado al registrar el usuario y al reenviar el email de verificación.
   */
  requestVerification(token: string, expiresAt: Date): User {
    return new User({
      ...this.props,
      emailVerificationToken: token,
      emailVerificationExpiresAt: expiresAt,
    });
  }

  /**
   * Marca el email como verificado y activa la cuenta (PENDING → ACTIVE).
   *
   * @remarks
   * Limpia el token de verificación tras su uso para que no pueda
   * reutilizarse (invariante de un solo uso).
   */
  verifyEmail(): User {
    return new User({
      ...this.props,
      emailVerified: true,
      status: UserStatus.ACTIVE,
      emailVerificationToken: undefined,
      emailVerificationExpiresAt: undefined,
    });
  }

  /**
   * Indica si el token de verificación de email ya expiró respecto a `now`.
   * Un usuario sin token asignado se considera expirado.
   */
  isEmailVerificationTokenExpired(now: Date): boolean {
    if (!this.props.emailVerificationExpiresAt) return true;
    return this.props.emailVerificationExpiresAt <= now;
  }

  /**
   * Asigna un nuevo token de recuperación de contraseña con su expiración.
   * Usado al solicitar "olvidé mi contraseña".
   */
  requestPasswordReset(token: string, expiresAt: Date): User {
    return new User({
      ...this.props,
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt,
    });
  }

  /**
   * Indica si el token de recuperación de contraseña ya expiró respecto a
   * `now`. Un usuario sin token asignado se considera expirado.
   */
  isPasswordResetTokenExpired(now: Date): boolean {
    if (!this.props.passwordResetExpiresAt) return true;
    return this.props.passwordResetExpiresAt <= now;
  }

  /**
   * Limpia el token de recuperación de contraseña tras su uso, para que
   * no pueda reutilizarse (invariante de un solo uso).
   */
  consumePasswordReset(): User {
    return new User({
      ...this.props,
      passwordResetToken: undefined,
      passwordResetExpiresAt: undefined,
    });
  }

  /**
   * Reemplaza el hash de contraseña y limpia el flag `mustChangePassword`.
   * Usado por `CompleteFirstLoginUseCase` al resolver el cambio de
   * contraseña obligatorio de un worker recién provisionado.
   *
   * @remarks
   * Por simetría con `consumePasswordReset()`, solo toca los campos
   * directamente relacionados (hash + flag); no limpia intentos fallidos ni
   * bloqueos temporales, ya que esos son responsabilidad de
   * `resetFailedAttempts()`/`releaseTemporaryBlock()`.
   */
  changePasswordAndClearRequirement(newPasswordHash: string): User {
    return new User({
      ...this.props,
      passwordHash: newPasswordHash,
      mustChangePassword: false,
    });
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
