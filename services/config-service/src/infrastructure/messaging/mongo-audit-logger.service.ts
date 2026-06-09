import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { AuditLogger, ConfigAuditEntry } from '@application/ports/audit-logger.port';

import { ConfigAuditLog, type ConfigAuditDocument } from './config-audit.schema';

/**
 * Implementación MongoDB del logger de auditoría de configuración.
 *
 * @remarks
 * Los errores de escritura se suprimen para no interrumpir las operaciones
 * principales — la auditoría es de "mejor esfuerzo".
 */
@Injectable()
export class MongoAuditLoggerService implements AuditLogger {
  constructor(
    @InjectModel(ConfigAuditLog.name)
    private readonly model: Model<ConfigAuditDocument>,
  ) {}

  async log(entry: ConfigAuditEntry): Promise<void> {
    try {
      await this.model.create({
        ...entry,
        timestamp: new Date(),
      });
    } catch {
      // Silenciado intencionalmente — los fallos de auditoría no deben romper el flujo principal
    }
  }
}
