/**
 * Evento base para análisis y estadísticas.
 * 
 * ❗ No representa dominio.
 * ❗ Es infraestructura de observabilidad.
 */
export interface LogEvent {
  eventName: string;
  timestamp: string;
  service: string;
  metadata?: Record<string, unknown>;
}
