import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma/index.js';

/**
 * Cliente Prisma gestionado por el ciclo de vida de NestJS.
 *
 * @remarks
 * Se conecta al inicializar el módulo y desconecta al destruirlo
 * para evitar conexiones colgantes durante recargas en desarrollo.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
