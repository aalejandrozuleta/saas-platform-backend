import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  const messages = {
    es: {
      'auth.invalid_credentials': 'Credenciales inválidas',
      'common.internal_error': 'Error interno',
    },
    en: {
      'auth.invalid_credentials': 'Invalid credentials',
    },
  };

  beforeEach(() => {
    service = new I18nService(messages, 'es');
  });

  it('debe traducir usando el idioma solicitado', () => {
    const result = service.translate('auth.invalid_credentials', 'en');

    expect(result).toBe('Invalid credentials');
  });

  it('debe usar el idioma por defecto si no se especifica idioma', () => {
    const result = service.translate('auth.invalid_credentials');

    expect(result).toBe('Credenciales inválidas');
  });

  it('debe usar fallback al idioma por defecto si no existe la traducción en el idioma solicitado', () => {
    const result = service.translate('common.internal_error', 'en');

    expect(result).toBe('Error interno');
  });

  it('debe normalizar locales regionales al idioma disponible', () => {
    const result = service.translate(
      'auth.invalid_credentials',
      'es-CO,es;q=0.9',
    );

    expect(result).toBe('Credenciales inválidas');
  });

  it('debe interpolar parámetros en la traducción', () => {
    const interpolationService = new I18nService(
      {
        es: {
          'auth.user_blocked':
            'Usuario bloqueado hasta {{blockedUntil}}',
        },
      },
      'es',
    );

    const result = interpolationService.translate(
      'auth.user_blocked',
      'es',
      {
        blockedUntil: '2026-03-20T10:00:00Z',
      },
    );

    expect(result).toBe(
      'Usuario bloqueado hasta 2026-03-20T10:00:00Z',
    );
  });

  it('debe retornar la clave si no existe traducción', () => {
    const result = service.translate('unknown.key', 'en');

    expect(result).toBe('unknown.key');
  });
});
