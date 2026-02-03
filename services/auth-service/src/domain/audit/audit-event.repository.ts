import { AuditEvent } from "./audit-event.type";

/**
 * Puerto de salida para persistencia de auditoría.
 * No conoce Mongo, NestJS ni ninguna base de datos.
 */
export interface AuditEventRepository {
  /**
   * Guarda un evento de auditoría.
   */
  save(event: AuditEvent): Promise<void>;
}
