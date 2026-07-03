import { compactResponseMeta } from './response-meta.util';
import type { ApiSuccessResponse, SuccessResponseOptions } from './response.interface';

/**
 * Construye una respuesta exitosa estándar ({@link ApiSuccessResponse}).
 *
 * `meta` se "compacta" automáticamente (se eliminan claves `undefined`) y
 * se omite por completo del resultado si queda vacío, para no ensuciar el
 * payload con campos vacíos.
 *
 * @param data - Payload de la respuesta.
 * @param options - `message` opcional y `meta` (timestamp, path, requestId, etc.).
 * @returns Objeto listo para devolver desde un controller (`res.json(...)` o `return`).
 *
 * @example
 * ```ts
 * \@Get(':id')
 * findOne(@Param('id') id: string) {
 *   const invoice = this.service.findOne(id);
 *   return successResponse(invoice, { message: 'Factura encontrada' });
 * }
 * ```
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
