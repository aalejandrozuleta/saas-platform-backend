import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { MaintenanceWindow } from '@domain/entities/maintenance-window/maintenance-window.entity';
import { MAINTENANCE_WINDOW_REPOSITORY } from '@domain/token/repositories.tokens';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import type { MaintenanceWindowRepository } from '@domain/repositories/maintenance-window.repository';
import type { AuditLogger } from '@application/ports/audit-logger.port';
import type { ScheduleMaintenanceWindowDto, MaintenanceWindowResponseDto } from '@application/dto/maintenance/schedule-maintenance-window.dto';

/**
 * Programa una ventana de mantenimiento con validación de fechas y solapamiento.
 */
@Injectable()
export class ScheduleMaintenanceWindowUseCase {
  constructor(
    @Inject(MAINTENANCE_WINDOW_REPOSITORY)
    private readonly repo: MaintenanceWindowRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(dto: ScheduleMaintenanceWindowDto): Promise<MaintenanceWindowResponseDto> {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);

    if (endAt <= startAt) {
      throw DomainErrorFactory.invalidDateRange();
    }

    const overlapping = await this.repo.findOverlapping(startAt, endAt, dto.tenantId ?? null);
    if (overlapping.length > 0) {
      throw DomainErrorFactory.maintenanceWindowOverlap();
    }

    const window = new MaintenanceWindow({
      id: randomUUID(),
      title: dto.title,
      description: dto.description ?? null,
      startAt,
      endAt,
      tenantId: dto.tenantId ?? null,
      isActive: true,
      createdBy: dto.createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.repo.save(window);

    await this.auditLogger.log({
      action: 'MAINTENANCE_WINDOW_SCHEDULED',
      resource: 'MaintenanceWindow',
      resourceId: saved.id,
      newValue: { title: saved.title, startAt, endAt },
      performedBy: dto.createdBy,
      tenantId: dto.tenantId,
    });

    return {
      id: saved.id,
      title: saved.title,
      description: saved.description,
      startAt: saved.startAt,
      endAt: saved.endAt,
      tenantId: saved.tenantId,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
    };
  }
}
