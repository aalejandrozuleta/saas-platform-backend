import { AsyncLocalStorage } from 'node:async_hooks';

import { type RequestContext } from './request-context.interface';

/**
 * Almacenamiento de contexto por request usando AsyncLocalStorage.
 */
export const requestContextStorage =
  new AsyncLocalStorage<RequestContext>();
