/**
 * Contexto de ejecución de una request.
 * 
 * Se propaga durante el ciclo de vida usando AsyncLocalStorage.
 */
export interface RequestContext {
  /** Identificador único de la request */
  requestId: string;

  /** Identificador de correlación entre servicios */
  correlationId?: string;

  /** Usuario autenticado (si existe) */
  userId?: string;
}
