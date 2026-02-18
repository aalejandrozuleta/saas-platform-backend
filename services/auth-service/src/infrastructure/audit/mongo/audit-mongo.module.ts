import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditEventMongoRepository } from '@infrastructure/persistence/mongo/audit-event-mongo.repository';
import { AUDIT_EVENT_REPOSITORY } from '@domain/token/services.tokens';

import { AuditEventDocument, AuditEventSchema } from './audit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AuditEventDocument.name,
        schema: AuditEventSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: AUDIT_EVENT_REPOSITORY,
      useClass: AuditEventMongoRepository,
    },
  ],
  exports: [AUDIT_EVENT_REPOSITORY], // ✅ SOLO EL PUERTO
})
export class AuditMongoModule {}