import { FileI18nLoader } from './file-i18n.loader';

jest.mock('@saas/shared', () => ({
  ...jest.requireActual('@saas/shared'),
  loadMessagesFromDirectory: jest.fn().mockReturnValue({
    es: { 'common.error': 'Error' },
  }),
}));

describe('FileI18nLoader (api-gateway)', () => {
  it('debe cargar los mensajes del directorio i18n', () => {
    const loader = new FileI18nLoader();
    const messages = loader.load();

    expect(messages).toBeDefined();
    expect(typeof messages).toBe('object');
  });
});
