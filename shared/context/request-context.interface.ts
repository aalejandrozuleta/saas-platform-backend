/**
 * Contexto de ejecución de una request.
 * 
 * Se usa para trazabilidad, logging y auditoría.
 */
export interface RequestContext {
  requestId: string;
  correlationId?: string;
  userId?: string;
}
