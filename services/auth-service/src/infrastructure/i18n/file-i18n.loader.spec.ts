import { join } from 'node:path';

import { loadMessagesFromDirectory } from '@saas/shared';

import { FileI18nLoader } from './file-i18n.loader';

jest.mock('@saas/shared', () => ({
  loadMessagesFromDirectory: jest.fn(),
}));

describe('FileI18nLoader', () => {
  let loader: FileI18nLoader;

  beforeEach(() => {
    loader = new FileI18nLoader();
    jest.clearAllMocks();
  });

  it('debe cargar mensajes desde la carpeta i18n del servicio', () => {
    (loadMessagesFromDirectory as jest.Mock).mockReturnValue({
      es: { greeting: 'Hola' },
      en: { greeting: 'Hello' },
    });

    const result = loader.load();

    expect(loadMessagesFromDirectory).toHaveBeenCalledWith(
      join(process.cwd(), 'src', 'i18n'),
    );
    expect(result).toEqual({
      es: { greeting: 'Hola' },
      en: { greeting: 'Hello' },
    });
  });
});
