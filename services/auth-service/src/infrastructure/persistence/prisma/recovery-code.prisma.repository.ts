import { Injectable } from '@nestjs/common';
import { RecoveryCodeRepository } from '@application/ports/recovery-code.repository';

import { PrismaService } from './prisma.service';

/**
 * Implementación Prisma del repositorio de códigos de recuperación (2FA).
 *
 * Implementa {@link RecoveryCodeRepository}. Los códigos se almacenan
 * como hashes (`codeHash`), nunca en texto plano.
 */
@Injectable()
export class RecoveryCodePrismaRepository implements RecoveryCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Inserta un lote de hashes de códigos de recuperación para el usuario.
   *
   * @remarks
   * Se usa típicamente al (re)generar el set completo de códigos de
   * recuperación de 2FA; llamar junto a {@link deleteAllByUser} para
   * reemplazar el set anterior.
   */
  async createMany(userId: string, codeHashes: string[]): Promise<void> {
    await this.prisma.recoveryCode.createMany({
      data: codeHashes.map((codeHash) => ({ userId, codeHash })),
    });
  }

  /**
   * Elimina todos los códigos de recuperación de un usuario.
   *
   * @remarks
   * Se invoca al desactivar 2FA o al regenerar códigos, para evitar
   * que queden hashes obsoletos utilizables.
   */
  async deleteAllByUser(userId: string): Promise<void> {
    await this.prisma.recoveryCode.deleteMany({ where: { userId } });
  }
}
