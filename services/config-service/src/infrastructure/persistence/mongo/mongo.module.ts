import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvService } from '@config/env/env.service';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';

import { ConfigAuditLog, ConfigAuditLogSchema } from '../../messaging/config-audit.schema';
import { MongoAuditLoggerService } from '../../messaging/mongo-audit-logger.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [EnvService],
      useFactory: (env: EnvService) => ({ uri: env.get('MONGO_URL') }),
    }),
    MongooseModule.forFeature([
      { name: ConfigAuditLog.name, schema: ConfigAuditLogSchema },
    ]),
  ],
  providers: [
    MongoAuditLoggerService,
    { provide: AUDIT_LOGGER, useExisting: MongoAuditLoggerService },
  ],
  exports: [AUDIT_LOGGER, MongoAuditLoggerService],
})
export class MongoModule {}
