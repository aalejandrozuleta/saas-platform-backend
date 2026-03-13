import { type ApiResponse } from './response.interface';

/**
 * Construye una respuesta exitosa estándar.
 */
export const successResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data
});
