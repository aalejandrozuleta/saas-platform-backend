import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AuditEventDocument,
  AuditEventSchema,
} from './audit.schema';
import { MongoAuditEventRepository } from './audit.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AuditEventDocument.name,
        schema: AuditEventSchema,
      },
    ]),
  ],
  providers: [MongoAuditEventRepository],
  exports: [MongoAuditEventRepository],
})
export class AuditMongoModule {}
