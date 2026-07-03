import { Injectable } from '@nestjs/common';
import { MaintenanceWindow } from '@domain/entities/maintenance-window/maintenance-window.entity';
import type { MaintenanceWindowRepository } from '@domain/repositories/maintenance-window.repository';

import type { MaintenanceWindow as PrismaMaintenanceWindow } from '../../../generated/prisma';

import { PrismaService } from './prisma.service';

/**
 * Implementación de `MaintenanceWindowRepository` sobre Prisma/PostgreSQL.
 * Traduce entre las filas de la tabla `MaintenanceWindow` y la entidad de dominio.
 */
@Injectable()
export class MaintenanceWindowPrismaRepository implements MaintenanceWindowRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Busca una ventana por ID. */
  async findById(id: string): Promise<MaintenanceWindow | null> {
    const row = await this.prisma.maintenanceWindow.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  /** Ventanas marcadas como activas y que aún no han finalizado (`endAt >= ahora`). */
  async findActive(): Promise<MaintenanceWindow[]> {
    const now = new Date();
    const rows = await this.prisma.maintenanceWindow.findMany({
      where: { isActive: true, endAt: { gte: now } },
      orderBy: { startAt: 'asc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  /** Todas las ventanas, más recientes primero. */
  async findAll(): Promise<MaintenanceWindow[]> {
    const rows = await this.prisma.maintenanceWindow.findMany({
      orderBy: { startAt: 'desc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  /**
   * Ventanas activas cuyo rango se solapa con [`startAt`, `endAt`).
   * La condición `startAt < endAt AND endAt > startAt` detecta cualquier
   * intersección entre los dos rangos, no solo la igualdad exacta.
   */
  async findOverlapping(startAt: Date, endAt: Date): Promise<MaintenanceWindow[]> {
    const rows = await this.prisma.maintenanceWindow.findMany({
      where: {
        isActive: true,
        AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
      },
    });
    return rows.map((r) => this.toDomain(r));
  }

  /** Crea o actualiza (upsert) una ventana de mantenimiento por ID. */
  async save(window: MaintenanceWindow): Promise<MaintenanceWindow> {
    const snap = window.toSnapshot();
    const row = await this.prisma.maintenanceWindow.upsert({
      where: { id: snap.id },
      create: {
        id: snap.id,
        title: snap.title,
        description: snap.description,
        startAt: snap.startAt,
        endAt: snap.endAt,
        isActive: snap.isActive,
        notifiedAt: snap.notifiedAt,
        createdBy: snap.createdBy,
        createdAt: snap.createdAt,
        updatedAt: snap.updatedAt,
      },
      update: {
        isActive: snap.isActive,
        notifiedAt: snap.notifiedAt,
        updatedAt: snap.updatedAt,
      },
    });
    return this.toDomain(row);
  }

  /** Elimina la ventana por ID. */
  async delete(id: string): Promise<void> {
    await this.prisma.maintenanceWindow.delete({ where: { id } });
  }

  /** Mapea una fila de Prisma a la entidad de dominio `MaintenanceWindow`. */
  private toDomain(row: PrismaMaintenanceWindow): MaintenanceWindow {
    return new MaintenanceWindow({
      id: row.id,
      title: row.title,
      description: row.description,
      startAt: row.startAt,
      endAt: row.endAt,
      isActive: row.isActive,
      notifiedAt: row.notifiedAt,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
