/** Entrada de auditoría para un cambio de configuración de plataforma. */
export interface ConfigAuditEntry {
  action: string;
  resource: string;
  resourceId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  performedBy?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Puerto para registrar cambios de configuración en el log de auditoría.
 *
 * @remarks
 * La implementación (`MongoAuditLoggerService`) trata la auditoría como
 * "mejor esfuerzo": un fallo al escribir el log no debe interrumpir el
 * caso de uso que lo originó.
 */
export interface AuditLogger {
  log(entry: ConfigAuditEntry): Promise<void>;
}
