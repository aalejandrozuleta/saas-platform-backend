import { Injectable } from '@nestjs/common';
import { MaintenanceWindow } from '@domain/entities/maintenance-window/maintenance-window.entity';
import type { MaintenanceWindowRepository } from '@domain/repositories/maintenance-window.repository';
import { PrismaService } from './prisma.service';

@Injectable()
export class MaintenanceWindowPrismaRepository implements MaintenanceWindowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MaintenanceWindow | null> {
    const row = await this.prisma.maintenanceWindow.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findActive(): Promise<MaintenanceWindow[]> {
    const now = new Date();
    const rows = await this.prisma.maintenanceWindow.findMany({
      where: { isActive: true, endAt: { gte: now } },
      orderBy: { startAt: 'asc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findAll(): Promise<MaintenanceWindow[]> {
    const rows = await this.prisma.maintenanceWindow.findMany({
      orderBy: { startAt: 'desc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findOverlapping(startAt: Date, endAt: Date): Promise<MaintenanceWindow[]> {
    const rows = await this.prisma.maintenanceWindow.findMany({
      where: {
        isActive: true,
        AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
      },
    });
    return rows.map((r) => this.toDomain(r));
  }

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

  async delete(id: string): Promise<void> {
    await this.prisma.maintenanceWindow.delete({ where: { id } });
  }

  private toDomain(row: any): MaintenanceWindow {
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
