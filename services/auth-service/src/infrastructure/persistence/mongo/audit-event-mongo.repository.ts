import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditEvent } from '@domain/audit/audit-event.type';
import { AuditEventRepository } from '@domain/audit/audit-event.repository';

import { AuditEventDocument } from './mongo.service';



/**
 * Repositorio Mongo para auditoría (Mongoose)
 */
@Injectable()
export class AuditEventMongoRepository
  implements AuditEventRepository
{
  constructor(
    @InjectModel(AuditEventDocument.name)
    private readonly model: Model<AuditEventDocument>,
  ) {}

  async save(event: AuditEvent): Promise<void> {
    await this.model.create(event);
  }
}
