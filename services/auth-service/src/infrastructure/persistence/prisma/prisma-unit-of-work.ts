import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '@application/ports/unit-of-work.port';

import { Prisma } from '../../../generated/prisma';

import { PrismaService } from './prisma.service';

/**
 * Implementación Prisma del patrón Unit of Work.
 *
 * Implementa {@link UnitOfWork} envolviendo el trabajo recibido en una
 * transacción de Prisma (`$transaction`), garantizando que todas las
 * operaciones ejecutadas con el `tx` entregado se confirmen o reviertan
 * de forma atómica.
 */
@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta `work` dentro de una transacción Prisma.
   *
   * @param work - Función que recibe el `Prisma.TransactionClient` y
   * debe usarlo para todas las operaciones que deban ser atómicas.
   */
  async execute<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return work(tx);
    });
  }
}
