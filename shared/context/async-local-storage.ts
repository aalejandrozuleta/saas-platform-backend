import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestContext } from './request-context.interface';

/**
 * Almacenamiento de contexto por request usando AsyncLocalStorage.
 */
export const requestContextStorage =
  new AsyncLocalStorage<RequestContext>();
