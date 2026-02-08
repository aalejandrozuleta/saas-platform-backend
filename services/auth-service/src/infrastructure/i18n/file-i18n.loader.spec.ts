import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { FileI18nLoader } from './file-i18n.loader';


/**
 * Mock del módulo fs
 */
jest.mock('node:fs', () => ({
  readFileSync: jest.fn(),
}));

/**
 * Mock del módulo path
 */
jest.mock('node:path', () => ({
  join: jest.fn(),
}));

describe('FileI18nLoader', () => {
  let loader: FileI18nLoader;

  beforeEach(() => {
    loader = new FileI18nLoader();
    jest.clearAllMocks();
  });

  it('debe cargar correctamente los archivos i18n para en y es', () => {
    // Arrange
    const basePath = '/app/src/i18n';

    (join as jest.Mock)
      .mockReturnValueOnce(basePath) // basePath
      .mockReturnValueOnce(`${basePath}/en/auth.json`)
      .mockReturnValueOnce(`${basePath}/es/auth.json`);

    (readFileSync as jest.Mock)
      .mockReturnValueOnce(JSON.stringify({ login: 'Login' }))
      .mockReturnValueOnce(JSON.stringify({ login: 'Iniciar sesión' }));

    // Act
    const result = loader.load();

    // Assert
    expect(result).toEqual({
      en: { login: 'Login' },
      es: { login: 'Iniciar sesión' },
    });

    expect(readFileSync).toHaveBeenCalledTimes(2);
    expect(join).toHaveBeenCalled();
  });

  it('debe lanzar error si el JSON es inválido', () => {
    // Arrange
    (join as jest.Mock).mockReturnValue('/invalid/path/auth.json');
    (readFileSync as jest.Mock).mockReturnValue('INVALID_JSON');

    // Act & Assert
    expect(() => loader.load()).toThrow(SyntaxError);
  });
});
