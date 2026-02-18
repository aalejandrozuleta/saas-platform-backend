import { Prisma } from '@prisma/client';

/**
 * Repositorio de seguridad del usuario.
 */
export interface SecurityRepository {

  /**
   * Registra un intento fallido y bloquea la cuenta
   * si se supera el máximo permitido.
   */
  registerFailedAttempt(
    userId: string,
    maxAttempts: number,
    lockDurationMinutes: number,
    now: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;

  /**
   * Resetea intentos fallidos tras login exitoso.
   */
  resetFailedLoginAttempts(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;

  /**
   * Obtiene información de seguridad adicional.
   */
  findByUserId(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<{
    trustedCountries: string[];
  } | null>;
}
