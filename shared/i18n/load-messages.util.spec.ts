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

  it('debe ignorar entradas que no sean archivos JSON ni directorios', () => {
    (readdirSync as jest.Mock)
      .mockReturnValueOnce([createDirent('es', true)])
      .mockReturnValueOnce([
        createDirent('README.md', false),
        createDirent('auth.json', false),
      ]);

    (readFileSync as jest.Mock).mockReturnValueOnce(
      JSON.stringify({ 'auth.login_success': 'Inicio exitoso' }),
    );

    const result = loadMessagesFromDirectory('/app/src/i18n');

    expect(result.es).toEqual({ 'auth.login_success': 'Inicio exitoso' });
  });

  it('debe cargar recursivamente archivos JSON dentro de subdirectorios de locale', () => {
    (readdirSync as jest.Mock)
      .mockReturnValueOnce([createDirent('es', true)])
      .mockReturnValueOnce([createDirent('auth', true)])
      .mockReturnValueOnce([createDirent('login.json', false)]);

    (readFileSync as jest.Mock).mockReturnValueOnce(
      JSON.stringify({ 'auth.login': 'Login' }),
    );

    const result = loadMessagesFromDirectory('/app/src/i18n');

    expect(result.es).toEqual({ 'auth.login': 'Login' });
  });
});

const createDirent = (name: string, isDirectory: boolean) => ({
  name,
  isDirectory: () => isDirectory,
  isFile: () => !isDirectory,
});
