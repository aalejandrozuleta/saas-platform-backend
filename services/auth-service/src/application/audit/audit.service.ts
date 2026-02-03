import { AuditEventRepository } from '../../domain/audit/audit-event.repository';
import { AuditEvent } from '../../domain/audit/audit-event.type';

/**
 * Caso de uso para registrar auditoría de seguridad.
 */
export class AuditService {
  constructor(
    private readonly repository: AuditEventRepository,
  ) {}

  /**
   * Registra un evento de auditoría.
   */
  async log(event: Omit<AuditEvent, 'createdAt'>): Promise<void> {
    await this.repository.save({
      ...event,
      createdAt: new Date(),
    });
  }
}
