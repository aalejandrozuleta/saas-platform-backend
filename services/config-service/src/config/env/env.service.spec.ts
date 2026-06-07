import { EnvService } from './env.service';

describe('EnvService', () => {
  const original = process.env;

  beforeEach(() => {
    process.env = {
      NODE_ENV: 'test',
      PORT: '3002',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      MONGO_URL: 'mongodb://localhost:27017/audit',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      CONFIG_CACHE_TTL: '300',
    };
  });

  afterEach(() => {
    process.env = original;
  });

  it('parses all required env vars', () => {
    const svc = new EnvService();
    expect(svc.get('NODE_ENV')).toBe('test');
    expect(svc.get('PORT')).toBe(3002);
    expect(svc.get('DATABASE_URL')).toBe('postgresql://user:pass@localhost:5432/db');
    expect(svc.get('REDIS_HOST')).toBe('localhost');
    expect(svc.get('CONFIG_CACHE_TTL')).toBe(300);
  });

  it('applies default CONFIG_CACHE_TTL when not provided', () => {
    delete process.env['CONFIG_CACHE_TTL'];
    const svc = new EnvService();
    expect(svc.get('CONFIG_CACHE_TTL')).toBe(300);
  });

  it('throws on invalid NODE_ENV', () => {
    process.env['NODE_ENV'] = 'invalid';
    expect(() => new EnvService()).toThrow();
  });

  it('throws when DATABASE_URL is missing', () => {
    delete process.env['DATABASE_URL'];
    expect(() => new EnvService()).toThrow();
  });
});
