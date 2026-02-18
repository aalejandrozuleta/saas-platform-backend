import { Prisma } from '@prisma/client';

import { Device } from '../entities/device/device.entity';

export abstract class DeviceRepository {
  abstract getByUserIdAndFingerprint(
    userId: string,
    fingerprint: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Device | null>;

  abstract save(
    device: Device,
    tx?: Prisma.TransactionClient,
  ): Promise<Device>;
}
