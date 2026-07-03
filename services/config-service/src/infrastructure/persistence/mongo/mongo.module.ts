import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvService } from '@config/env/env.service';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';

import { ConfigAuditLog, ConfigAuditLogSchema } from '../../messaging/config-audit.schema';
import { MongoAuditLoggerService } from '../../messaging/mongo-audit-logger.service';

/**
 * Módulo de persistencia sobre MongoDB para el log de auditoría.
 * Registra la conexión (`MONGO_URL`) y el modelo `ConfigAuditLog`, y
 * enlaza el token `AUDIT_LOGGER` a `MongoAuditLoggerService` para que
 * el resto del dominio dependa solo de la interfaz, no de Mongo.
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [EnvService],
      useFactory: (env: EnvService) => ({ uri: env.get('MONGO_URL') }),
    }),
    MongooseModule.forFeature([{ name: ConfigAuditLog.name, schema: ConfigAuditLogSchema }]),
  ],
  providers: [
    MongoAuditLoggerService,
    { provide: AUDIT_LOGGER, useExisting: MongoAuditLoggerService },
  ],
  exports: [AUDIT_LOGGER, MongoAuditLoggerService],
})
export class MongoModule {}
