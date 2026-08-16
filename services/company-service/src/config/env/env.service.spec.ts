import { EnvService } from './env.service';

const validEnv = {
  NODE_ENV: 'test',
  PORT: '3004',
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  JWT_ACCESS_SECRET: 'a'.repeat(40),
  AUTH_SERVICE_URL: 'http://auth-service:3001',
  AUTH_SERVICE_TIMEOUT: '5000',
  INTERNAL_SERVICE_SECRET: 'b'.repeat(40),
  STORAGE_ENDPOINT: 'http://localhost:9000',
  STORAGE_ACCESS_KEY: 'access-key',
  STORAGE_SECRET_KEY: 'secret-key',
  STORAGE_PUBLIC_URL: 'http://localhost:9000/company-logos',
};

describe('EnvService', () => {
  const original = process.env;

  afterEach(() => {
    process.env = original;
  });

  it('expone las variables parseadas y tipadas', () => {
    process.env = { ...validEnv } as never;

    const service = new EnvService();

    expect(service.get('PORT')).toBe(3004);
    expect(service.get('AUTH_SERVICE_TIMEOUT')).toBe(5000);
    expect(service.get('JWT_ACCESS_SECRET')).toBe(validEnv.JWT_ACCESS_SECRET);
  });

  it('aplica los defaults de PORT y AUTH_SERVICE_*', () => {
    const { PORT, AUTH_SERVICE_URL, AUTH_SERVICE_TIMEOUT, ...rest } = validEnv;

    process.env = { ...rest } as never;

    const service = new EnvService();

    expect(service.get('PORT')).toBe(3004);
    expect(service.get('AUTH_SERVICE_URL')).toBe('http://auth-service:3001');
    expect(service.get('AUTH_SERVICE_TIMEOUT')).toBe(5000);
  });

  it('falla si falta o es inválida alguna variable', () => {
    process.env = { ...validEnv, JWT_ACCESS_SECRET: 'corto' } as never;

    expect(() => new EnvService()).toThrow(/Error en variables de entorno/);
  });
});
