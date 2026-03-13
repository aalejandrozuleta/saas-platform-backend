import { envSchema } from './env.schema';

describe('envSchema', () => {
  /**
   * Helper para generar un conjunto de variables válidas
   */
  const createValidEnv = () => ({
   NODE_ENV: 'development',
      PORT: '3000',

      AUTH_SERVICE_URL: 'http://localhost:3001',
      AUTH_SERVICE_TIMEOUT: '5000',
      AUTH_SERVICE_RETRIES: '2',
      AUTH_SERVICE_CIRCUIT_TIMEOUT: '10000',

      JWT_ACCESS_SECRET: 'super-secret-jwt-key',

      CORS_ORIGINS: 'http://localhost:3000,http://localhost:4200',

      TRUST_PROXY: '1',

      SMTP_HOST: 'smtp.mail.com',
      SMTP_PORT: '587',
      SMTP_USER: 'user',
      SMTP_PASS: 'pass',
      SMTP_SECURE: 'false',

      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: '',
  });

  it('debe parsear correctamente un entorno válido', () => {
    const env = createValidEnv();

    const result = envSchema.parse(env);

    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3000);
    expect(result.AUTH_SERVICE_TIMEOUT).toBe(5000);
    expect(result.SMTP_PORT).toBe(587);
    expect(result.SMTP_SECURE).toBe(true);
  });

  it('debe transformar CORS_ORIGINS en array', () => {
    const env = createValidEnv();

    const result = envSchema.parse(env);

    expect(result.CORS_ORIGINS).toEqual([
      'http://localhost:3000',
      'http://localhost:4200',
    ]);
  });

  it('debe lanzar error si NODE_ENV es inválido', () => {
    const env = createValidEnv();
    env.NODE_ENV = 'invalid';

    expect(() => envSchema.parse(env)).toThrow();
  });
});