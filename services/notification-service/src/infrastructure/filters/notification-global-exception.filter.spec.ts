import { type ArgumentsHost } from '@nestjs/common';
import { I18nService } from '@saas/shared';

import { NotificationGlobalExceptionFilter } from './notification-global-exception.filter';

describe('NotificationGlobalExceptionFilter', () => {
  let filter: NotificationGlobalExceptionFilter;
  let i18n: I18nService;
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    i18n = new I18nService({ es: { 'common.internal_error': 'Error interno' } }, 'es');
    filter = new NotificationGlobalExceptionFilter(i18n);

    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });

    host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('debe delegar en el filtro base y responder 500 para errores no reconocidos', () => {
    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ message: 'Error interno' }),
      }),
    );
  });
});
