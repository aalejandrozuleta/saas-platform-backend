import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma-client/client';
import { UnitOfWork } from '@application/ports/unit-of-work.port';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) { }

  async execute<T>(
    work: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return work(tx);
    });
  }
}
