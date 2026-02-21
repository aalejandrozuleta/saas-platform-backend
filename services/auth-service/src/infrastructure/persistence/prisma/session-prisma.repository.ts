import { Injectable } from '@nestjs/common';
import { SessionRepository } from '@application/ports/session.repository';
import type { PrismaClient } from '@prisma/client';

import { PrismaService } from './prisma.service';


/**
 * Implementación Prisma del repositorio de sesiones.
 *
 * Responsabilidades:
 * - Crear nuevas sesiones
 * - Contar sesiones activas
 * - Revocar sesiones activas
 */
@Injectable()
export class SessionPrismaRepository implements SessionRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  /**
   * Obtiene el cliente correcto dependiendo
   * si estamos dentro de una transacción.
   */
  private client(tx?: PrismaClient) {
    return tx ?? this.prisma;
  }

  /**
   * Crea una nueva sesión.
   *
   * @param params - Datos necesarios para crear la sesión
   * @param tx - Cliente transaccional opcional
   * @returns Objeto con id de la sesión creada
   */
  async create(
    params: {
      userId: string;
      deviceId?: string;
      ipAddress: string;
      country?: string;
    },
    tx?: PrismaClient,
  ): Promise<{ id: string }> {

    const session = await this.client(tx).session.create({
      data: {
        userId: params.userId,
        deviceId: params.deviceId,
        ipAddress: params.ipAddress,
        country: params.country,
      },
      select: {
        id: true,
      },
    });

    return session;
  }

  /**
   * Cuenta las sesiones activas de un usuario.
   *
   * Una sesión activa es aquella que:
   * - No tiene revokedAt
   * - No tiene endedAt
   *
   * @param userId - Identificador del usuario
   * @param tx - Cliente transaccional opcional
   * @returns Número de sesiones activas
   */
  async countActiveSessions(
    userId: string,
    tx?: PrismaClient,
  ): Promise<number> {

    return this.client(tx).session.count({
      where: {
        userId,
        revokedAt: null,
        endedAt: null,
      },
    });
  }

  /**
   * Revoca la sesión activa más antigua.
   *
   * Se utiliza para mantener un máximo de sesiones activas.
   *
   * @param userId - Identificador del usuario
   * @param now - Fecha actual
   * @param tx - Cliente transaccional opcional
   */
  async revokeOldestActiveSession(
    userId: string,
    now: Date,
    tx?: PrismaClient,
  ): Promise<void> {

    const client = this.client(tx);

    const oldest = await client.session.findFirst({
      where: {
        userId,
        revokedAt: null,
        endedAt: null,
      },
      orderBy: {
        startedAt: 'asc',
      },
      select: {
        id: true,
      },
    });

    if (!oldest) {
      return;
    }

    await client.session.update({
      where: { id: oldest.id },
      data: {
        revokedAt: now,
      },
    });
  }
}
