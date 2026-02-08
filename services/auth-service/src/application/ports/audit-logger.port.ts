/**
 * Puerto de dominio para auditoría
 */
export interface AuditLogger {
  /**
   * Registra un evento de auditoría
   */
  log(event: unknown): Promise<void>;
}
