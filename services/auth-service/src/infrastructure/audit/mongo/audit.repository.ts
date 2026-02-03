import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AuditEventRepository } from '../../../domain/audit/audit-event.repository';
import { AuditEvent } from '../../../domain/audit/audit-event.type';

import { AuditEventDocument } from './audit.schema';

/**
 * Implementación MongoDB del repositorio de auditoría.
 */
export class MongoAuditEventRepository
  implements AuditEventRepository
{
  constructor(
    @InjectModel(AuditEventDocument.name)
    private readonly model: Model<AuditEventDocument>,
  ) {}

  /**
   * Guarda un evento de auditoría en MongoDB.
   */
  async save(event: AuditEvent): Promise<void> {
    await this.model.create(event);
  }
}
