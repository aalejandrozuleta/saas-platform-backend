import { UserStatus } from "@domain/enums/user-status.enum";
import { EmailVO } from "@domain/value-objects/email.vo";

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

  /** Estado del usuario */
  status: UserStatus;

  /** Email verificado */
  emailVerified: boolean;

  /** Intentos fallidos de login */
  failedLoginAttempts: number;

  /** Bloqueo temporal */
  blockedUntil?: Date;

  /** Fecha de creación */
  createdAt: Date;
}
