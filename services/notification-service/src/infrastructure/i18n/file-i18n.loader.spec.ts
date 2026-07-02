import { FileI18nLoader } from './file-i18n.loader';

describe('FileI18nLoader', () => {
  let loader: FileI18nLoader;

  beforeEach(() => {
    loader = new FileI18nLoader();
  });

  it('debe cargar los mensajes desde src/i18n agrupados por idioma', () => {
    const messages = loader.load();

    expect(Object.keys(messages)).toEqual(expect.arrayContaining(['es', 'en']));
    expect(typeof messages.es).toBe('object');
    expect(typeof messages.en).toBe('object');
  });

  it('debe incluir las mismas claves en cada idioma soportado', () => {
    const messages = loader.load();

    const esKeys = Object.keys(messages.es).sort();
    const enKeys = Object.keys(messages.en).sort();

    expect(esKeys).toEqual(enKeys);
  });
});
