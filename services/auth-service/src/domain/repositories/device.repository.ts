import { type Prisma } from '../../generated/prisma';
import { type Device } from '../entities/device/device.entity';

/**
 * Repositorio de dispositivos del usuario.
 */
export abstract class DeviceRepository {
  /**
   * Busca el dispositivo de un usuario por su fingerprint único.
   */
  abstract getByUserIdAndFingerprint(
    userId: string,
    fingerprint: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Device | null>;

  /**
   * Crea o actualiza (upsert) un dispositivo.
   */
  abstract save(device: Device, tx?: Prisma.TransactionClient): Promise<Device>;
}
