import { Device } from '@domain/entities/device/device.entity';

import { DeviceMapper } from '../mappers/device.mapper';

import { DevicePrismaRepository } from './device.prisma.repository';
import { PrismaService } from './prisma.service';

describe('DevicePrismaRepository', () => {
  let repository: DevicePrismaRepository;

  let prisma: {
    device: {
      findUnique: jest.Mock;
      upsert: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      device: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    repository = new DevicePrismaRepository(
      prisma as unknown as PrismaService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByUserIdAndFingerprint', () => {
    it('debe retornar un Device cuando existe', async () => {
      const rawDevice = { id: 'device-1' };

      const domainDevice = {} as Device;

      prisma.device.findUnique.mockResolvedValue(rawDevice);

      jest
        .spyOn(DeviceMapper, 'toDomain')
        .mockReturnValue(domainDevice);

      const result = await repository.getByUserIdAndFingerprint(
        'user-1',
        'fingerprint-1',
      );

      expect(prisma.device.findUnique).toHaveBeenCalledWith({
        where: {
          userId_fingerprint: {
            userId: 'user-1',
            fingerprint: 'fingerprint-1',
          },
        },
      });

      expect(DeviceMapper.toDomain).toHaveBeenCalledWith(rawDevice);

      expect(result).toBe(domainDevice);
    });

    it('debe retornar null si no existe dispositivo', async () => {
      prisma.device.findUnique.mockResolvedValue(null);

      const result = await repository.getByUserIdAndFingerprint(
        'user-1',
        'fingerprint-1',
      );

      expect(result).toBeNull();
    });

    it('debe usar el cliente transaccional si se proporciona', async () => {
      const tx = {
        device: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };

      await repository.getByUserIdAndFingerprint(
        'user-1',
        'fp',
        tx as unknown as PrismaService,
      );

      expect(tx.device.findUnique).toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('debe persistir el dispositivo usando upsert', async () => {
      const device = { id: 'device-1' } as Device;

      const persistence = { id: 'device-1' };
      const rawSaved = { id: 'device-1' };

      jest
        .spyOn(DeviceMapper, 'toPersistence')
        .mockReturnValue(persistence as any);

      jest
        .spyOn(DeviceMapper, 'toDomain')
        .mockReturnValue(device);

      prisma.device.upsert.mockResolvedValue(rawSaved);

      const result = await repository.save(device);

      expect(prisma.device.upsert).toHaveBeenCalledWith({
        where: { id: 'device-1' },
        update: persistence,
        create: persistence,
      });

      expect(result).toBe(device);
    });

    it('debe usar cliente transaccional en save', async () => {
      const tx = {
        device: {
          upsert: jest.fn().mockResolvedValue({ id: 'device-1' }),
        },
      };

      const device = { id: 'device-1' } as Device;

      jest
        .spyOn(DeviceMapper, 'toPersistence')
        .mockReturnValue({ id: 'device-1' } as any);

      jest
        .spyOn(DeviceMapper, 'toDomain')
        .mockReturnValue(device);

      await repository.save(
        device,
        tx as unknown as PrismaService,
      );

      expect(tx.device.upsert).toHaveBeenCalled();
    });
  });
});