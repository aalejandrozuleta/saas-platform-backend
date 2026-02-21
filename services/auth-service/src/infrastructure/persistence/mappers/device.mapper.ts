import { Device } from '@domain/entities/device/device.entity';
import { Device as PrismaDevice } from '@prisma/client';


/**
 * Mapper entre Prisma Device y Device de dominio
 */
export class DeviceMapper {

  static toDomain(prisma: PrismaDevice): Device {
    return Device.fromPersistence({
      id: prisma.id,
      userId: prisma.userId,
      fingerprint: prisma.fingerprint,
      ipAddress: prisma.ipAddress,
      country: prisma.country ?? undefined,
      isTrusted: prisma.isTrusted,
      lastUsedAt: prisma.lastUsedAt ?? undefined,
      createdAt: prisma.createdAt,
    });
  }

  static toPersistence(device: Device) {
    return {
      id: device.id,
      userId: device.userId,
      fingerprint: device.fingerprint,
      ipAddress: device.ipAddress,
      country: device.country ?? null,
      isTrusted: device.isTrusted,
      lastUsedAt: device.lastUsedAt ?? null,
      createdAt: device.createdAt,
    };
  }
}
