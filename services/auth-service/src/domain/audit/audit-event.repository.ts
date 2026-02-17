import { AuditEvent } from './audit-event.type';

/**
 * Puerto de dominio para persistencia de auditoría.
 *
 * ⚠ No conoce Mongo.
 * ⚠ No conoce NestJS.
 * ⚠ Solo define contrato.
 */
export interface AuditEventRepository {
  /**
   * Guarda un evento de auditoría.
   */
  save(event: AuditEvent): Promise<void>;
}
