import { EnvService } from '@config/env/env.service';

describe('EnvService', () => {
  const originalEnv = process.env;

  /**
   * Conjunto mínimo de variables válidas según envSchema
   */
  const validEnv = {
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
  };

  beforeEach(() => {
    process.env = { ...validEnv } as NodeJS.ProcessEnv;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should initialize correctly with valid environment variables', () => {
    const service = new EnvService();

    expect(service).toBeDefined();
  });

  it('should throw if environment is invalid', () => {
    process.env.NODE_ENV = 'invalid';

    expect(() => new EnvService()).toThrow('Environment validation failed');
  });

  it('should return values correctly with get()', () => {
    const service = new EnvService();

    expect(service.get('PORT')).toBe(3000);
    expect(service.get('NODE_ENV')).toBe('development');
  });

  it('should return transformed values', () => {
    const service = new EnvService();

    expect(service.get('CORS_ORIGINS')).toEqual([
      'http://localhost:3000',
      'http://localhost:4200',
    ]);
  });
});