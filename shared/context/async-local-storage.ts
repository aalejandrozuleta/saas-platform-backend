import { AsyncLocalStorage } from 'node:async_hooks';

import { type RequestContext } from './request-context.interface';

/**
 * Almacén de {@link RequestContext} basado en `AsyncLocalStorage` de Node.
 *
 * Permite acceder al contexto de la request actual (requestId,
 * correlationId, userId) desde cualquier punto del código que se ejecute
 * dentro de la misma cadena async — sin tener que inyectarlo ni pasarlo
 * como parámetro explícito (a diferencia de un `REQUEST`-scoped provider
 * de Nest, que obliga a marcar toda la cadena de dependencias como
 * request-scoped).
 *
 * El ciclo de vida es:
 * 1. {@link HttpRequestLoggingInterceptor} resuelve/crea el contexto al
 *    inicio de cada request y lo establece con `requestContextStorage.run(ctx, ...)`,
 *    envolviendo el resto del pipeline de Nest (controller, servicios, etc.).
 * 2. Mientras ese `run()` está activo, cualquier código —sync o async,
 *    incluyendo callbacks y promesas encadenadas— puede leer el contexto
 *    con `requestContextStorage.getStore()`. Así lo hace {@link PinoLoggerAdapter}
 *    para adjuntar `requestId`/`correlationId`/`userId` a cada log sin que
 *    quien loguea tenga que pasarlos manualmente.
 * 3. Fuera de una request HTTP (jobs, listeners de eventos disparados sin
 *    pasar por el interceptor, scripts) `getStore()` devuelve `undefined`;
 *    el código que lee el contexto debe tolerar ese caso.
 *
 * @example
 * ```ts
 * // Lectura del contexto en cualquier servicio, sin inyectarlo:
 * const ctx = requestContextStorage.getStore();
 * const requestId = ctx?.requestId ?? 'sin-contexto';
 * ```
 */
export const requestContextStorage = new AsyncLocalStorage<RequestContext>();
