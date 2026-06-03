import { EnvService } from './env.service';

describe('EnvService', () => {
  const validEnv = {
    NODE_ENV: 'test',
    JWT_ACCESS_SECRET: 'access-secret-min-10',
    JWT_REFRESH_SECRET: 'refresh-secret-min-10',
    DATABASE_URL: 'postgresql://localhost:5432/test',
    MONGO_URL: 'mongodb://localhost:27017/test',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
  };

  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('debe inicializar correctamente con variables de entorno válidas', () => {
    process.env = { ...validEnv } as NodeJS.ProcessEnv;

    const service = new EnvService();

    expect(service.get('NODE_ENV')).toBe('test');
    expect(service.get('REDIS_HOST')).toBe('localhost');
    expect(service.get('REDIS_PORT')).toBe(6379);
  });

  it('debe lanzar error si faltan variables de entorno requeridas', () => {
    process.env = {} as NodeJS.ProcessEnv;

    expect(() => new EnvService()).toThrow(
      'Error en variables de entorno',
    );
  });

  it('debe lanzar error si NODE_ENV tiene un valor inválido', () => {
    process.env = {
      ...validEnv,
      NODE_ENV: 'invalid',
    } as NodeJS.ProcessEnv;

    expect(() => new EnvService()).toThrow(
      'Error en variables de entorno',
    );
  });
});
