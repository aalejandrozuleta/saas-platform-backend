import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LogoutEvent } from '@application/events/logout/logout.event';
import { LogoutAllEvent } from '@application/events/logout/logout-all.event';
import { AuditLogger } from '@application/ports/audit-logger.port';
import { AuthActivityReportFactory } from '@application/audit/auth-activity-report.factory';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';

/**
 * Listener de eventos de cierre de sesión.
 *
 * @remarks
 * Responsabilidad única: reaccionar a eventos de dominio
 * relacionados con logout y registrar la actividad en el log de auditoría.
 *
 * No contiene lógica de negocio.
 */
@Injectable()
export class LogoutListener {
  constructor(
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  /**
   * Maneja el cierre de una sesión individual.
   *
   * @param event - Evento de logout emitido por {@link LogoutUseCase}
   */
  @OnEvent(LogoutEvent.name)
  async handleLogout(event: LogoutEvent): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.logout({
        userId: event.userId,
        sessionId: event.sessionId,
        ip: event.context.ip,
        country: event.context.country,
      }),
    );
  }

  /**
   * Maneja el cierre de todas las sesiones activas.
   *
   * @param event - Evento de logout global emitido por {@link LogoutAllUseCase}
   */
  @OnEvent(LogoutAllEvent.name)
  async handleLogoutAll(event: LogoutAllEvent): Promise<void> {
    await this.auditLogger.log(
      AuthActivityReportFactory.logoutAll({
        userId: event.userId,
        revokedCount: event.revokedCount,
        ip: event.context.ip,
        country: event.context.country,
      }),
    );
  }
}
