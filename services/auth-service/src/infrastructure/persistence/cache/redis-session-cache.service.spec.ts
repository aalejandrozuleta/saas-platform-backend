import { type Redis } from 'ioredis';

import { RedisSessionCacheService } from './redis-session-cache.service';

describe('RedisSessionCacheService', () => {
  let service: RedisSessionCacheService;
  let redis: jest.Mocked<Redis>;

  beforeEach(() => {
    redis = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn(),
      del: jest.fn().mockResolvedValue(1),
    } as any;

    service = new RedisSessionCacheService(redis);
  });

  describe('storeSession', () => {
    it('debe almacenar la sesión con role y permissions en Redis', async () => {
      await service.storeSession('sid-1', 'uid-1', 'dev-1', 900, 'EMPLOYEE', ['invoice:create']);

      expect(redis.set).toHaveBeenCalledWith(
        'session:sid-1',
        JSON.stringify({ userId: 'uid-1', deviceId: 'dev-1', role: 'EMPLOYEE', permissions: ['invoice:create'] }),
        'EX',
        900,
      );
    });

    it('debe usar valores por defecto cuando role y permissions son omitidos', async () => {
      await service.storeSession('sid-2', 'uid-2', null, 300);

      expect(redis.set).toHaveBeenCalledWith(
        'session:sid-2',
        JSON.stringify({ userId: 'uid-2', deviceId: null, role: '', permissions: [] }),
        'EX',
        300,
      );
    });
  });

  describe('getSession', () => {
    it('debe devolver los datos de sesión cuando existe', async () => {
      redis.get.mockResolvedValue(
        JSON.stringify({ userId: 'uid-1', role: 'BUSINESS_OWNER', permissions: ['org:manage'] }),
      );

      const result = await service.getSession('sid-1');

      expect(result).toEqual({ userId: 'uid-1', role: 'BUSINESS_OWNER', permissions: ['org:manage'] });
    });

    it('debe devolver null cuando la sesión no existe', async () => {
      redis.get.mockResolvedValue(null);

      const result = await service.getSession('sid-missing');

      expect(result).toBeNull();
    });

    it('debe devolver null si el valor Redis es JSON inválido', async () => {
      redis.get.mockResolvedValue('not-json{{{');

      const result = await service.getSession('sid-bad');

      expect(result).toBeNull();
    });

    it('debe usar valores por defecto si faltan campos en el JSON', async () => {
      redis.get.mockResolvedValue(JSON.stringify({}));

      const result = await service.getSession('sid-empty');

      expect(result).toEqual({ userId: '', role: '', permissions: [] });
    });
  });

  describe('isSessionActive', () => {
    it('debe devolver true si la sesión existe en Redis', async () => {
      redis.get.mockResolvedValue('{}');

      expect(await service.isSessionActive('sid-1')).toBe(true);
    });

    it('debe devolver false si la sesión no existe', async () => {
      redis.get.mockResolvedValue(null);

      expect(await service.isSessionActive('sid-gone')).toBe(false);
    });
  });

  describe('revokeSession', () => {
    it('debe eliminar la clave de la sesión en Redis', async () => {
      await service.revokeSession('sid-1');

      expect(redis.del).toHaveBeenCalledWith('session:sid-1');
    });
  });
});
