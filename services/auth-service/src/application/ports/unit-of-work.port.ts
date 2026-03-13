import { type Prisma } from '@prisma/client';

/**
 * Ejecuta una unidad de trabajo dentro de una transacción real.
 */
export interface UnitOfWork {
  execute<T>(
    work: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T>;
}
