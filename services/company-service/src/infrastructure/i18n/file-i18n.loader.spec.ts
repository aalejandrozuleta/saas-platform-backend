import { FileI18nLoader } from './file-i18n.loader';

describe('FileI18nLoader', () => {
  it('carga los mensajes es/en del servicio', () => {
    const cwd = jest.spyOn(process, 'cwd').mockReturnValue(`${__dirname}/../../..`);

    const messages = new FileI18nLoader().load();

    expect(messages.es['company.not_found']).toBeDefined();
    expect(messages.en['membership.already_exists']).toBeDefined();

    cwd.mockRestore();
  });
});
