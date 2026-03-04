import { AsyncLocalStorage } from 'node:async_hooks';

import { requestContextStorage } from './async-local-storage';
import type { RequestContext } from './request-context.interface';

describe('requestContextStorage', () => {
  it('debe ser una instancia de AsyncLocalStorage', () => {
    expect(requestContextStorage).toBeInstanceOf(AsyncLocalStorage);
  });

  it('debe almacenar y recuperar contexto', () => {
    const context: RequestContext = {
      requestId: 'req-123',
    } as RequestContext;

    requestContextStorage.run(context, () => {
      const store = requestContextStorage.getStore();

      expect(store).toEqual(context);
    });
  });

  it('debe retornar undefined fuera del contexto', () => {
    const store = requestContextStorage.getStore();

    expect(store).toBeUndefined();
  });
});