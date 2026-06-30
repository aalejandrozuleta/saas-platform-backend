import { type UserRole } from "@domain/enums/user-role.enum";
import { type UserStatus } from "@domain/enums/user-status.enum";
import { type EmailVO } from "@domain/value-objects/email.vo";

/**
 * Propiedades internas de la entidad User
 */
export interface UserProps {
  /** Identificador único */
  id: string;

  /** Email del usuario */
  email: EmailVO;

  /** Hash de contraseña */
  passwordHash: string;

  /** Rol del usuario */
  role: UserRole;

  /** Estado del usuario */
  status: UserStatus;

  /** Email verificado */
  emailVerified: boolean;

  /** Intentos fallidos de login */
  failedLoginAttempts: number;

  /** Bloqueo temporal */
  blockedUntil?: Date;

  /** Número de veces que la cuenta ha sido bloqueada (progressive lockout) */
  lockoutCount: number;

  /** Último login exitoso */
  lastLoginAt?: Date;

  /** Token de verificación de email (raw, expira en EMAIL_VERIFICATION_TTL) */
  emailVerificationToken?: string;

  /** Fecha de expiración del token de verificación */
  emailVerificationExpiresAt?: Date;

  /** Fecha de creación */
  createdAt: Date;
}
