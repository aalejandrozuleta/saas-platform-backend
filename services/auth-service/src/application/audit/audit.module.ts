import { Module } from '@nestjs/common';
import { AuditMongoModule } from '@infrastructure/audit/mongo/audit-mongo.module';

import { AuditService } from './audit.service';

@Module({
  imports: [AuditMongoModule],
  providers: [AuditService],
  exports: [AuditService], // 👈 CLAVE
})
export class AuditModule {}
