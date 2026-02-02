import { ApiResponse } from './response.interface';

/**
 * Construye una respuesta de error estándar.
 */
export const errorResponse = (error: unknown): ApiResponse<never> => ({
  success: false,
  error
});
