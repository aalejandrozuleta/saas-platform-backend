import { Inject } from '@nestjs/common';
import { AuditLogger } from '@application/ports/audit-logger.port';
import { AuditEventRepository } from '@domain/audit/audit-event.repository';
import { AuditEvent } from '@domain/audit/audit-event.type';
import { AUDIT_EVENT_REPOSITORY } from '@domain/audit/audit-event-repository.token';

/**
 * Servicio de auditoría
 * Implementación concreta del puerto AuditLogger
 */
export class AuditService implements AuditLogger {
  constructor(
    @Inject(AUDIT_EVENT_REPOSITORY)
    private readonly repository: AuditEventRepository,
  ) {}

  /**
   * Registra un evento de auditoría
   */
  async log(event: Omit<AuditEvent, 'createdAt'>): Promise<void> {
    await this.repository.save({
      ...event,
      createdAt: new Date(),
    });
  }
}
