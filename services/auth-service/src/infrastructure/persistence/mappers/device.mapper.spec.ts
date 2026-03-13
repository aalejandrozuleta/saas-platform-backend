import { Device } from '@domain/entities/device/device.entity';
import { type Device as PrismaDevice } from '@prisma/client';

import { DeviceMapper } from './device.mapper';

describe('DeviceMapper', () => {
  describe('toDomain', () => {
    it('debe mapear correctamente desde Prisma a dominio', () => {
      const prismaDevice: PrismaDevice = {
        id: 'device-1',
        userId: 'user-1',
        fingerprint: 'fp-123',
        deviceName: 'Chrome',
        os: 'Windows',
        browser: 'Chrome',
        ipAddress: '192.168.1.1',
        country: 'CO',
        isTrusted: true,
        lastUsedAt: new Date('2026-01-01'),
        createdAt: new Date('2025-01-01'),
      };

      const device = DeviceMapper.toDomain(prismaDevice);

      expect(device).toBeInstanceOf(Device);
      expect(device.id).toBe(prismaDevice.id);
      expect(device.userId).toBe(prismaDevice.userId);
      expect(device.fingerprint).toBe(prismaDevice.fingerprint);
      expect(device.ipAddress).toBe(prismaDevice.ipAddress);
      expect(device.country).toBe('CO');
      expect(device.isTrusted).toBe(true);
      expect(device.lastUsedAt).toEqual(prismaDevice.lastUsedAt);
      expect(device.createdAt).toEqual(prismaDevice.createdAt);
    });

    it('debe convertir null de Prisma a undefined en dominio', () => {
      const prismaDevice: PrismaDevice = {
        id: 'device-2',
        userId: 'user-2',
        fingerprint: 'fp-456',
        deviceName: null,
        os: null,
        browser: null,
        ipAddress: '10.0.0.1',
        country: null,
        isTrusted: false,
        lastUsedAt: null,
        createdAt: new Date(),
      };

      const device = DeviceMapper.toDomain(prismaDevice);

      expect(device.country).toBeUndefined();
      expect(device.lastUsedAt).toBeUndefined();
    });
  });

  describe('toPersistence', () => {
    it('debe mapear correctamente desde dominio a persistencia', () => {
      const device = Device.fromPersistence({
        id: 'device-3',
        userId: 'user-3',
        fingerprint: 'fp-789',
        ipAddress: '127.0.0.1',
        country: 'CL',
        isTrusted: true,
        lastUsedAt: new Date('2026-02-01'),
        createdAt: new Date('2025-02-01'),
      });

      const persistence = DeviceMapper.toPersistence(device);

      expect(persistence).toEqual({
        id: device.id,
        userId: device.userId,
        fingerprint: device.fingerprint,
        ipAddress: device.ipAddress,
        country: 'CL',
        isTrusted: true,
        lastUsedAt: device.lastUsedAt,
        createdAt: device.createdAt,
      });
    });

    it('debe convertir undefined a null para Prisma', () => {
      const device = Device.fromPersistence({
        id: 'device-4',
        userId: 'user-4',
        fingerprint: 'fp-000',
        ipAddress: '8.8.8.8',
        country: undefined,
        isTrusted: false,
        lastUsedAt: undefined,
        createdAt: new Date(),
      });

      const persistence = DeviceMapper.toPersistence(device);

      expect(persistence.country).toBeNull();
      expect(persistence.lastUsedAt).toBeNull();
    });
  });
});