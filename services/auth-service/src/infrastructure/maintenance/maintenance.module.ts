import { Module } from '@nestjs/common';

import { PrismaModule } from '../persistence/prisma/prisma.module';

import { TokenCleanupService } from './token-cleanup.service';


/**
 * Módulo encargado de tareas programadas
 * relacionadas con mantenimiento del sistema.
 */
@Module({
  imports: [PrismaModule],
  providers: [TokenCleanupService],
})
export class MaintenanceModule {}