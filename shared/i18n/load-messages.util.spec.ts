import { readdirSync, readFileSync } from 'node:fs';

import { loadMessagesFromDirectory } from './load-messages.util';

jest.mock('node:fs', () => ({
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe('loadMessagesFromDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe cargar y fusionar archivos JSON por idioma', () => {
    (readdirSync as jest.Mock)
      .mockReturnValueOnce([
        createDirent('en', true),
        createDirent('es', true),
      ])
      .mockReturnValueOnce([
        createDirent('auth.json', false),
        createDirent('common.json', false),
      ])
      .mockReturnValueOnce([
        createDirent('auth.json', false),
        createDirent('common.json', false),
      ]);

    (readFileSync as jest.Mock)
      .mockReturnValueOnce(
        JSON.stringify({ 'auth.login_success': 'Login successful' }),
      )
      .mockReturnValueOnce(
        JSON.stringify({ 'common.internal_error': 'Internal error' }),
      )
      .mockReturnValueOnce(
        JSON.stringify({ 'auth.login_success': 'Inicio exitoso' }),
      )
      .mockReturnValueOnce(
        JSON.stringify({ 'common.internal_error': 'Error interno' }),
      );

    const result = loadMessagesFromDirectory('/app/src/i18n');

    expect(result).toEqual({
      en: {
        'auth.login_success': 'Login successful',
        'common.internal_error': 'Internal error',
      },
      es: {
        'auth.login_success': 'Inicio exitoso',
        'common.internal_error': 'Error interno',
      },
    });
  });
});

const createDirent = (name: string, isDirectory: boolean) => ({
  name,
  isDirectory: () => isDirectory,
  isFile: () => !isDirectory,
});
