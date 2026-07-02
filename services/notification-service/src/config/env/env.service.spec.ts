import { EnvService } from './env.service';

describe('EnvService', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  const validEnv = {
    NODE_ENV: 'test',
    REDIS_HOST: 'localhost',
    RESEND_API_KEY: 'test-key',
  };

  it('debe parsear correctamente variables de entorno válidas', () => {
    process.env = { ...process.env, ...validEnv };

    const service = new EnvService();

    expect(service.get('NODE_ENV')).toBe('test');
    expect(service.get('REDIS_HOST')).toBe('localhost');
    expect(service.get('RESEND_API_KEY')).toBe('test-key');
  });

  it('debe aplicar valores por defecto cuando no se proveen', () => {
    process.env = { ...process.env, ...validEnv };
    delete process.env.PORT;
    delete process.env.RESEND_FROM_EMAIL;

    const service = new EnvService();

    expect(service.get('PORT')).toBe(3003);
    expect(service.get('RESEND_FROM_EMAIL')).toBe('noreply@saas-platform.dev');
    expect(service.get('EMAIL_QUEUE_ATTEMPTS')).toBe(5);
    expect(service.get('WS_QUEUE_ATTEMPTS')).toBe(3);
  });

  it('debe lanzar un error si falta una variable requerida', () => {
    process.env = { ...process.env };
    delete process.env.RESEND_API_KEY;
    process.env.NODE_ENV = 'test';
    process.env.REDIS_HOST = 'localhost';

    expect(() => new EnvService()).toThrow('Error en variables de entorno');
  });

  it('debe lanzar un error si NODE_ENV no es un valor válido', () => {
    process.env = { ...process.env, ...validEnv, NODE_ENV: 'invalid' as any };

    expect(() => new EnvService()).toThrow();
  });
});
