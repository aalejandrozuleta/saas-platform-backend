import { EnvService } from '@config/env/env.service';

describe('EnvService', () => {
  const originalEnv = process.env;

  /**
   * Crea un conjunto mínimo de variables válidas
   */
  const validEnv = {
    NODE_ENV: 'development',
    PORT: '3000',

    AUTH_SERVICE_URL: 'http://localhost:3001',
    AUTH_SERVICE_TIMEOUT: '5000',

    CORS_ORIGINS: 'http://localhost:3000,http://localhost:4200',

    TRUST_PROXY: '1',

    SMTP_HOST: 'smtp.mail.com',
    SMTP_PORT: '587',
    SMTP_USER: 'user',
    SMTP_PASS: 'pass',
    SMTP_SECURE: 'false',
  };

  beforeEach(() => {
    process.env = { ...validEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('debe inicializar correctamente con variables válidas', () => {
    const service = new EnvService();

    expect(service).toBeDefined();
  });

  it('debe lanzar error si el entorno es inválido', () => {
    process.env.NODE_ENV = 'invalid';

    expect(() => new EnvService()).toThrow('Environment validation failed');
  });

  it('debe retornar valores correctamente con get()', () => {
    const service = new EnvService();

    expect(service.get('PORT')).toBe(3000);
    expect(service.get('NODE_ENV')).toBe('development');
  });

  it('debe retornar valores transformados', () => {
    const service = new EnvService();

    expect(service.get('CORS_ORIGINS')).toEqual([
      'http://localhost:3000',
      'http://localhost:4200',
    ]);
  });
});