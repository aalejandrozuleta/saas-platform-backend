import { Injectable } from '@nestjs/common';
import { DeviceRepository } from '@domain/repositories/device.repository';
import { Device } from '@domain/entities/device/device.entity';

import { DeviceMapper } from '../mappers/device.mapper';

import { PrismaService } from './prisma.service';



@Injectable()
export class DevicePrismaRepository
  implements DeviceRepository
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getByUserIdAndFingerprint(
    userId: string,
    fingerprint: string,
    tx?: PrismaService,
  ): Promise<Device | null> {
    const client = tx ?? this.prisma;

    const device = await client.device.findUnique({
      where: {
        userId_fingerprint: {
          userId,
          fingerprint,
        },
      },
    });

    return device ? DeviceMapper.toDomain(device) : null;
  }

  async save(
    device: Device,
    tx?: PrismaService,
  ): Promise<Device> {
    const client = tx ?? this.prisma;

    const saved = await client.device.upsert({
      where: {
        id: device.id,
      },
      update: DeviceMapper.toPersistence(device),
      create: DeviceMapper.toPersistence(device),
    });

    return DeviceMapper.toDomain(saved);
  }
}
