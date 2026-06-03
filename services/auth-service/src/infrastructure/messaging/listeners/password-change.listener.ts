import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PasswordChangedEvent } from '@application/events/password/password-changed.event';
import { PasswordChangeFailedEvent } from '@application/events/password/password-change-failed.event';
import { AuditLogger } from '@application/ports/audit-logger.port';
import { AuthActivityReportFactory } from '@application/audit/auth-activity-report.factory';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';

/**
 * Listener de eventos de cambio de contraseña.
 *
 * Responsabilidad única: reaccionar a eventos de dominio
 * relacionados con cambio de contraseña y registrar auditoría.
 *
 * No contiene lógica de negocio.
 */
@Injectable()
export class PasswordChangeListener {
  constructor(
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  @OnEvent(PasswordChangedEvent.name)
  async handlePasswordChanged(event: PasswordChangedEvent): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.passwordChanged({
        userId: event.userId,
        ip: event.context.ip,
        country: event.context.country,
      }),
    );
  }

  @OnEvent(PasswordChangeFailedEvent.name)
  async handlePasswordChangeFailed(event: PasswordChangeFailedEvent): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.passwordChangeFailed({
        userId: event.userId,
        reason: event.reason,
        ip: event.context.ip,
        country: event.context.country,
      }),
    );
  }
}
