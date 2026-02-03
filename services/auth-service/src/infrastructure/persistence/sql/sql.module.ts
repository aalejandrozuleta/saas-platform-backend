import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EnvModule } from '@config/env/env.module';

/**
 * Módulo de persistencia SQL (PostgreSQL).
 */
@Module({
  imports: [EnvModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class SqlModule {}
