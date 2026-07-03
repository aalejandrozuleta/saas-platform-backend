import { Module } from '@nestjs/common';
import { EnvModule } from '@config/env/env.module';

import { PrismaService } from './prisma.service';

/**
 * Módulo de persistencia sobre PostgreSQL vía Prisma.
 * Expone `PrismaService`, usado por los repositorios de feature flags y
 * ventanas de mantenimiento.
 */
@Module({
  imports: [EnvModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
