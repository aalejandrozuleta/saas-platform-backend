import { randomUUID } from 'node:crypto';

import { Device } from '@domain/entities/device/device.entity';
import { type DeviceRepository } from '@domain/repositories/device.repository';

/**
 * Confía el dispositivo de un challenge (2FA, PASSWORD_CHANGE_REQUIRED):
 * lo crea si nunca existió, o lo marca confiable si ya existía. Superar el
 * challenge es prueba suficiente de que el dispositivo es legítimo.
 *
 * Compartido por `VerifyLoginChallengeUseCase` y `CompleteFirstLoginUseCase`
 * — ambos flujos resuelven un challenge token distinto pero terminan en el
 * mismo estado de dispositivo confiable.
 */
export async function resolveTrustedDevice(
  deviceRepository: DeviceRepository,
  userId: string,
  deviceFingerprint: string | undefined,
  context: { ip: string },
): Promise<Device> {
  const existing = deviceFingerprint
    ? await deviceRepository.getByUserIdAndFingerprint(userId, deviceFingerprint)
    : null;

  return existing
    ? existing.markAsTrusted()
    : Device.create({
        id: randomUUID(),
        userId,
        fingerprint: deviceFingerprint!,
        ipAddress: context.ip,
        isTrusted: true,
        createdAt: new Date(),
      });
}
