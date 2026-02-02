/**
 * Contrato estándar de respuesta HTTP.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: unknown;
}
