import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLogger } from '@application/ports/audit-logger.port';
import { AuthActivityReportFactory } from '@application/audit/auth-activity-report.factory';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import { TwoFactorEnabledEvent } from '@application/events/two-factor/two-factor-enabled.event';
import { TwoFactorVerifiedEvent } from '@application/events/two-factor/two-factor-verified.event';
import { TwoFactorDisabledEvent } from '@application/events/two-factor/two-factor-disabled.event';
import { RecoveryCodesRegeneratedEvent } from '@application/events/two-factor/recovery-codes-regenerated.event';

/**
 * Listener de eventos de autenticación de dos factores (2FA).
 *
 * @remarks
 * Escucha `TwoFactorEnabledEvent`, `TwoFactorVerifiedEvent` y
 * `TwoFactorDisabledEvent` (vía `@OnEvent`) y registra cada uno como
 * entrada de auditoría a través de {@link AuditLogger}, usando
 * {@link AuthActivityReportFactory} para construir el reporte.
 */
@Injectable()
export class TwoFactorListener {
  constructor(
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  @OnEvent(TwoFactorEnabledEvent.name)
  async handleEnabled(event: TwoFactorEnabledEvent): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.twoFactorEnabled({
        userId: event.userId,
        ip: event.context.ip,
        country: event.context.country,
      }),
    );
  }

  @OnEvent(TwoFactorVerifiedEvent.name)
  async handleVerified(event: TwoFactorVerifiedEvent): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.twoFactorVerified({
        userId: event.userId,
        ip: event.context.ip,
        country: event.context.country,
      }),
    );
  }

  @OnEvent(TwoFactorDisabledEvent.name)
  async handleDisabled(event: TwoFactorDisabledEvent): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.twoFactorDisabled({
        userId: event.userId,
        ip: event.context.ip,
        country: event.context.country,
      }),
    );
  }

  @OnEvent(RecoveryCodesRegeneratedEvent.name)
  async handleRecoveryCodesRegenerated(event: RecoveryCodesRegeneratedEvent): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.recoveryCodesRegenerated({
        userId: event.userId,
        ip: event.context.ip,
        country: event.context.country,
      }),
    );
  }
}
