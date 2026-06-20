import { HttpException, HttpStatus, Logger } from '@nestjs/common';

import { MaintenanceGuard } from './maintenance.guard';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRedis(cached: string | null = null) {
  return {
    get: jest.fn().mockResolvedValue(cached),
    set: jest.fn().mockResolvedValue('OK'),
  } as any;
}

function makeProxy(response?: { data: { maintenanceEnabled: boolean; maintenanceMessage: string | null } }) {
  return {
    forward: jest.fn().mockResolvedValue({ body: response ?? null }),
  } as any;
}

function makeContext(path = '/api/some-route') {
  const req = { path, method: 'GET', body: {}, headers: {} };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
  } as any;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('MaintenanceGuard', () => {
  let logWarnSpy: jest.SpyInstance;
  let logDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    logWarnSpy  = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    logDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  // ─── Bypass routes ──────────────────────────────────────────────────────────

  it('allows /health without checking maintenance status', async () => {
    const guard = new MaintenanceGuard(makeRedis(), makeProxy());
    await expect(guard.canActivate(makeContext('/health'))).resolves.toBe(true);
  });

  it('allows /config/maintenance/* without checking maintenance status', async () => {
    const guard = new MaintenanceGuard(makeRedis(), makeProxy());
    await expect(guard.canActivate(makeContext('/config/maintenance/mode'))).resolves.toBe(true);
  });

  // ─── Cache hit ──────────────────────────────────────────────────────────────

  it('uses Redis cache when available and maintenance is off', async () => {
    const cached = JSON.stringify({ maintenanceEnabled: false, maintenanceMessage: null });
    const guard = new MaintenanceGuard(makeRedis(cached), makeProxy());
    await expect(guard.canActivate(makeContext())).resolves.toBe(true);
  });

  it('blocks requests when cached status shows maintenance enabled', async () => {
    const cached = JSON.stringify({ maintenanceEnabled: true, maintenanceMessage: 'Back soon' });
    const guard = new MaintenanceGuard(makeRedis(cached), makeProxy());
    await expect(guard.canActivate(makeContext())).rejects.toThrow(HttpException);
  });

  // ─── Live fetch ─────────────────────────────────────────────────────────────

  it('fetches from config-service on cache miss and allows when not in maintenance', async () => {
    const proxy = makeProxy({ data: { maintenanceEnabled: false, maintenanceMessage: null } });
    const redis = makeRedis(null);
    const guard = new MaintenanceGuard(redis, proxy);

    await expect(guard.canActivate(makeContext())).resolves.toBe(true);
    expect(proxy.forward).toHaveBeenCalledWith(expect.anything(), '/maintenance/status');
    expect(redis.set).toHaveBeenCalledWith(
      'gateway:maintenance:status',
      expect.any(String),
      'EX',
      30,
    );
  });

  it('throws 503 when live fetch returns maintenanceEnabled=true', async () => {
    const proxy = makeProxy({ data: { maintenanceEnabled: true, maintenanceMessage: 'Upgrading DB' } });
    const guard = new MaintenanceGuard(makeRedis(null), proxy);

    const err = await guard.canActivate(makeContext()).catch((e) => e);
    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
  });

  // ─── Fail-open ──────────────────────────────────────────────────────────────

  it('fails open when config-service throws an HttpException', async () => {
    const proxy = { forward: jest.fn().mockRejectedValue(new HttpException('Not Found', 404)) } as any;
    const guard = new MaintenanceGuard(makeRedis(null), proxy);

    await expect(guard.canActivate(makeContext())).resolves.toBe(true);
    expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('HTTP 404'));
  });

  it('fails open when config-service is unreachable (ECONNREFUSED)', async () => {
    const networkErr = Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' });
    const proxy = { forward: jest.fn().mockRejectedValue(networkErr) } as any;
    const guard = new MaintenanceGuard(makeRedis(null), proxy);

    await expect(guard.canActivate(makeContext())).resolves.toBe(true);
    expect(logDebugSpy).toHaveBeenCalledWith(expect.stringContaining('ECONNREFUSED'));
  });

  it('fails open when circuit breaker is open', async () => {
    const circuitErr = Object.assign(new Error('circuit open'), { code: 'EOPENBREAKER' });
    const proxy = { forward: jest.fn().mockRejectedValue(circuitErr) } as any;
    const guard = new MaintenanceGuard(makeRedis(null), proxy);

    await expect(guard.canActivate(makeContext())).resolves.toBe(true);
    expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('circuit breaker'));
  });

  it('fails open when Redis throws and config-service is also unavailable', async () => {
    const redis = { get: jest.fn().mockRejectedValue(new Error('Redis down')), set: jest.fn() } as any;
    const networkErr = Object.assign(new Error('refused'), { code: 'ECONNREFUSED' });
    const proxy = { forward: jest.fn().mockRejectedValue(networkErr) } as any;

    const guard = new MaintenanceGuard(redis, proxy);
    await expect(guard.canActivate(makeContext())).resolves.toBe(true);
  });

  // ─── Maintenance message ─────────────────────────────────────────────────────

  it('includes custom maintenance message in 503 response', async () => {
    const msg = 'Volvemos a las 18:00';
    const proxy = makeProxy({ data: { maintenanceEnabled: true, maintenanceMessage: msg } });
    const guard = new MaintenanceGuard(makeRedis(null), proxy);

    const err = await guard.canActivate(makeContext()).catch((e) => e);
    const body = (err as HttpException).getResponse() as any;
    expect(body.error.message).toBe(msg);
  });

  it('falls back to default message when maintenanceMessage is null', async () => {
    const proxy = makeProxy({ data: { maintenanceEnabled: true, maintenanceMessage: null } });
    const guard = new MaintenanceGuard(makeRedis(null), proxy);

    const err = await guard.canActivate(makeContext()).catch((e) => e);
    const body = (err as HttpException).getResponse() as any;
    expect(body.error.message).toContain('maintenance');
  });

  it('fails open when config-service throws an HttpException with string response (logFetchError branch)', async () => {
    const proxy = { forward: jest.fn().mockRejectedValue(new HttpException('Service Down', HttpStatus.SERVICE_UNAVAILABLE)) } as any;
    const guard = new MaintenanceGuard(makeRedis(null), proxy);

    await expect(guard.canActivate(makeContext())).resolves.toBe(true);
    expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('503'));
  });

  it('fails open when a non-Error object is thrown (String(err) branch)', async () => {
    const proxy = { forward: jest.fn().mockRejectedValue('raw string error') } as any;
    const guard = new MaintenanceGuard(makeRedis(null), proxy);

    await expect(guard.canActivate(makeContext())).resolves.toBe(true);
    expect(logWarnSpy).toHaveBeenCalledWith(expect.stringContaining('raw string error'));
  });
});
