import {
  globalRateLimiter,
  authRateLimiter,
} from './rate-limit.middleware';

describe('rate limit middleware', () => {
  it('debe exportar middlewares', () => {
    expect(globalRateLimiter).toBeDefined();
    expect(authRateLimiter).toBeDefined();
  });

  it('debe ser funciones middleware', () => {
    expect(typeof globalRateLimiter).toBe('function');
    expect(typeof authRateLimiter).toBe('function');
  });
});