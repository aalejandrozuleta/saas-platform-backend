import { Module } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';

import { PrismaService } from './prisma.service';

/**
 * Módulo de persistencia SQL (PostgreSQL).
 */
@Module({
  imports: [EnvModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class SqlModule {}
