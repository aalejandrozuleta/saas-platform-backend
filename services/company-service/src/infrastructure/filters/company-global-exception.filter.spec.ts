import { GlobalExceptionFilter } from '@saas/shared';

import { CompanyGlobalExceptionFilter } from './company-global-exception.filter';

describe('CompanyGlobalExceptionFilter', () => {
  it('delega el manejo de la excepción en el filtro compartido', () => {
    const baseCatch = jest
      .spyOn(GlobalExceptionFilter.prototype, 'catch')
      .mockImplementation(() => undefined);

    const filter = new CompanyGlobalExceptionFilter({ translate: jest.fn() } as never);
    const exception = new Error('boom');
    const host = {} as never;

    filter.catch(exception, host);

    expect(baseCatch).toHaveBeenCalledWith(exception, host);

    baseCatch.mockRestore();
  });
});
