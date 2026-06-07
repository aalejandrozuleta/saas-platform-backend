import { RedisConfigCacheService } from './redis-config-cache.service';

function makeRedis() {
  return {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
  } as any;
}

describe('RedisConfigCacheService', () => {
  it('get delegates to redis with namespace prefix', async () => {
    const redis = makeRedis();
    const svc = new RedisConfigCacheService(redis);
    await svc.get('maintenance.enabled');
    expect(redis.get).toHaveBeenCalledWith('config-service:maintenance.enabled');
  });

  it('get returns null when key not found', async () => {
    const svc = new RedisConfigCacheService(makeRedis());
    const result = await svc.get('missing');
    expect(result).toBeNull();
  });

  it('set calls redis with EX option', async () => {
    const redis = makeRedis();
    const svc = new RedisConfigCacheService(redis);
    await svc.set('my.key', 'value', 300);
    expect(redis.set).toHaveBeenCalledWith('config-service:my.key', 'value', 'EX', 300);
  });

  it('del delegates to redis with namespace prefix', async () => {
    const redis = makeRedis();
    const svc = new RedisConfigCacheService(redis);
    await svc.del('my.key');
    expect(redis.del).toHaveBeenCalledWith('config-service:my.key');
  });

  it('flush does nothing when no matching keys', async () => {
    const redis = makeRedis();
    const svc = new RedisConfigCacheService(redis);
    await svc.flush('flag:*');
    expect(redis.del).not.toHaveBeenCalled();
  });

  it('flush deletes all matching keys', async () => {
    const redis = makeRedis();
    redis.keys.mockResolvedValue(['config-service:flag:a', 'config-service:flag:b']);
    const svc = new RedisConfigCacheService(redis);
    await svc.flush('flag:*');
    expect(redis.del).toHaveBeenCalledWith('config-service:flag:a', 'config-service:flag:b');
  });
});
