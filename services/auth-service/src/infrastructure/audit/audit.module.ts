import { Module } from '@nestjs/common';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import { LoginAuditService } from '@application/audit/login-audit.service';
import { ActivityReportMongoModule } from '@saas/shared';
import { MetricsModule } from '@infrastructure/metrics/metrics.module';

import { AuthActivityRecorderService } from '../../application/audit/auth-activity-recorder.service';

/**
 * Módulo de auditoría de auth-service.
 *
 * @remarks
 * Registra la colección Mongo `user_activity_reports` (vía
 * `ActivityReportMongoModule` del paquete compartido) y conecta el token
 * `AUDIT_LOGGER` a {@link AuthActivityRecorderService} (`useExisting`, no
 * una nueva instancia), que además reporta métricas de actividad. También
 * expone {@link LoginAuditService} para que los use cases de login puedan
 * registrar auditoría específica del dominio (intentos, bloqueos,
 * dispositivo/país no confiable) sin conocer los detalles de persistencia.
 */
@Module({
  imports: [
    MetricsModule,
    ActivityReportMongoModule.register({
      collection: 'user_activity_reports',
    }),
  ],
  providers: [
    LoginAuditService,
    AuthActivityRecorderService,
    {
      provide: AUDIT_LOGGER,
      useExisting: AuthActivityRecorderService,
    },
  ],
  exports: [AUDIT_LOGGER, LoginAuditService],
})
export class AuditModule {}
