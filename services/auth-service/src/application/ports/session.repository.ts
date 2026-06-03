import { type Prisma } from '@prisma/client';

export interface SessionRepository {

  create(
    params: {
      userId: string;
      deviceId?: string;
      ipAddress: string;
      country?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<{ id: string }>;

  countActiveSessions(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number>;

  revokeOldestActiveSession(
    userId: string,
    now: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<void>;

  revokeAllUserSessions(
    userId: string,
    now: Date,
  ): Promise<string[]>;

  /**
   * Revoca una sesión específica por su ID.
   *
   * @remarks
   * Si la sesión no existe o ya está revocada, la operación
   * se completa silenciosamente (idempotente).
   *
   * @param sessionId - Identificador de la sesión a revocar
   * @param now - Marca de tiempo de revocación
   */
  revokeById(
    sessionId: string,
    now: Date,
  ): Promise<void>;
}
