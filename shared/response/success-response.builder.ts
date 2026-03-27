import { compactResponseMeta } from './response-meta.util';
import type {
  ApiSuccessResponse,
  SuccessResponseOptions,
} from './response.interface';

/**
 * Construye una respuesta exitosa estándar.
 */
export const successResponse = <T>(
  data: T,
  options: SuccessResponseOptions = {},
): ApiSuccessResponse<T> => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (options.message) {
    response.message = options.message;
  }

  const meta = compactResponseMeta(options.meta);

  if (meta) {
    response.meta = meta;
  }

  return response;
};
