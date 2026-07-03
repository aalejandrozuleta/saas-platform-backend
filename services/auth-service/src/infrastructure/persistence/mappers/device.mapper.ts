import { Device } from '@domain/entities/device/device.entity';

import { type Device as PrismaDevice } from '../../../generated/prisma';

/**
 * Mapper entre Prisma Device y Device de dominio
 */
export class DeviceMapper {
  /**
   * Convierte un registro Prisma de dispositivo a entidad de dominio.
   *
   * @remarks
   * `country` y `lastUsedAt` llegan como `null` desde Prisma cuando no
   * se han registrado aún; se normalizan a `undefined` porque así los
   * espera la entidad de dominio (campos opcionales, no nulos).
   */
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

  /**
   * Convierte una entidad de dominio Device al shape esperado por Prisma.
   *
   * @remarks
   * Inverso de {@link toDomain}: aquí `country` y `lastUsedAt` se
   * coercionan de `undefined` a `null`, ya que Prisma/la base de datos
   * usa `null` para representar la ausencia de valor.
   */
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
