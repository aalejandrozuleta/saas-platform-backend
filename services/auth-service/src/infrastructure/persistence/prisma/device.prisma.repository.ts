import { Injectable } from '@nestjs/common';
import { DeviceRepository } from '@domain/repositories/device.repository';
import { Device } from '@domain/entities/device/device.entity';

import { DeviceMapper } from '../mappers/device.mapper';

import { PrismaService } from './prisma.service';

/**
 * Implementación Prisma del repositorio de dispositivos.
 *
 * Implementa {@link DeviceRepository} usando el modelo `device` de Prisma.
 */
@Injectable()
export class DevicePrismaRepository implements DeviceRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca un dispositivo por la combinación única `userId` + `fingerprint`.
   *
   * @param tx - Cliente transaccional opcional; si no se provee se usa
   * el cliente Prisma por defecto.
   */
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

  /**
   * Crea o actualiza un dispositivo (upsert por `id`).
   *
   * @remarks
   * Se usa upsert para no distinguir entre "primer login desde este
   * dispositivo" (create) y "dispositivo ya conocido" (update): ambos
   * casos se resuelven con la misma llamada.
   *
   * @param tx - Cliente transaccional opcional
   */
  async save(device: Device, tx?: PrismaService): Promise<Device> {
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
