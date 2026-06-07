export interface ConfigAuditEntry {
  action: string;
  resource: string;
  resourceId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  performedBy?: string;
  tenantId?: string | null;
  metadata?: Record<string, unknown>;
}

/** Puerto para registrar cambios de configuración en el log de auditoría. */
export interface AuditLogger {
  log(entry: ConfigAuditEntry): Promise<void>;
}
