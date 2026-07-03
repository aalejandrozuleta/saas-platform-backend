/**
 * @remarks Barrel del módulo de contexto async: agrupa el tipo
 * {@link RequestContext} y el almacén {@link requestContextStorage}
 * (AsyncLocalStorage) usados para propagar el contexto de request.
 */
export * from './request-context.interface';
export * from './async-local-storage';
