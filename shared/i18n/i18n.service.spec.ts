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

  describe('resolveLanguage — rutas de fallback', () => {
    it('debe retornar el idioma base si el subtag no tiene mensajes', () => {
      // 'es-AR' no existe → fallback a 'es' (que sí existe)
      const resolved = service.resolveLanguage('es-AR');
      expect(resolved).toBe('es');
    });

    it('debe retornar el defaultLang si ningún fallback existe', () => {
      // 'fr' no existe → defaultLang 'es'
      const resolved = service.resolveLanguage('fr');
      expect(resolved).toBe('es');
    });

    it('debe retornar el idioma por defecto cuando lang es undefined', () => {
      const resolved = service.resolveLanguage(undefined);
      expect(resolved).toBe('es');
    });
  });

  describe('interpolate — tipos de valores', () => {
    const svc = new I18nService(
      { es: { 'test.key': 'Valor: {{v}}' } },
      'es',
    );

    it('debe interpolar un número', () => {
      expect(svc.translate('test.key', 'es', { v: 42 })).toBe('Valor: 42');
    });

    it('debe interpolar un booleano', () => {
      expect(svc.translate('test.key', 'es', { v: true })).toBe('Valor: true');
    });

    it('debe interpolar un bigint', () => {
      expect(svc.translate('test.key', 'es', { v: BigInt(99) })).toBe('Valor: 99');
    });

    it('debe interpolar una Date con toISOString()', () => {
      const d = new Date('2026-01-01T00:00:00.000Z');
      expect(svc.translate('test.key', 'es', { v: d })).toBe(
        'Valor: 2026-01-01T00:00:00.000Z',
      );
    });

    it('debe interpolar un objeto con JSON.stringify', () => {
      expect(
        svc.translate('test.key', 'es', { v: { x: 1 } }),
      ).toBe('Valor: {"x":1}');
    });

    it('debe preservar el placeholder si el parámetro es null', () => {
      expect(svc.translate('test.key', 'es', { v: null as any })).toBe(
        'Valor: {{v}}',
      );
    });

    it('debe preservar el placeholder si el parámetro es undefined', () => {
      expect(svc.translate('test.key', 'es', { v: undefined })).toBe(
        'Valor: {{v}}',
      );
    });
  });
});
