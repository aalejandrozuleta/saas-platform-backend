import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuccessResponseBuilder } from '@saas/shared';
import { SetMaintenanceModeUseCase } from '@application/use-cases/set-maintenance-mode.use-case';
import { GetMaintenanceStatusUseCase } from '@application/use-cases/get-maintenance-status.use-case';
import { ScheduleMaintenanceWindowUseCase } from '@application/use-cases/schedule-maintenance-window.use-case';
import { SetMaintenanceModeDto } from '@application/dto/maintenance/set-maintenance-mode.dto';
import { ScheduleMaintenanceWindowDto } from '@application/dto/maintenance/schedule-maintenance-window.dto';
import {
  GetMaintenanceStatusSwagger,
  SetMaintenanceModeSwagger,
  SetReadOnlyModeSwagger,
  ScheduleMaintenanceWindowSwagger,
  GetMaintenanceWindowsSwagger,
  CancelMaintenanceWindowSwagger,
} from '@infrastructure/swagger/maintenance.swagger';
import { APP_CONFIG_REPOSITORY, MAINTENANCE_WINDOW_REPOSITORY } from '@domain/token/repositories.tokens';
import { Inject } from '@nestjs/common';
import type { AppConfigRepository } from '@domain/repositories/app-config.repository';
import type { MaintenanceWindowRepository } from '@domain/repositories/maintenance-window.repository';
import { AppConfig } from '@domain/entities/app-config/app-config.entity';
import { ConfigCategory } from '@domain/enums/config-category.enum';
import { randomUUID } from 'node:crypto';
import { READONLY_KEY } from '@application/use-cases/get-maintenance-status.use-case';
import { CONFIG_CACHE, AUDIT_LOGGER } from '@domain/token/services.tokens';
import type { ConfigCache } from '@application/ports/config-cache.port';
import type { AuditLogger } from '@application/ports/audit-logger.port';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Controlador de mantenimiento y modo solo-lectura.
 *
 * @remarks
 * Gestiona el modo mantenimiento global, el modo solo-lectura y las
 * ventanas de mantenimiento programadas.
 */
@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly setMaintenanceMode: SetMaintenanceModeUseCase,
    private readonly getMaintenanceStatus: GetMaintenanceStatusUseCase,
    private readonly scheduleWindow: ScheduleMaintenanceWindowUseCase,
    @Inject(APP_CONFIG_REPOSITORY)
    private readonly configRepo: AppConfigRepository,
    @Inject(MAINTENANCE_WINDOW_REPOSITORY)
    private readonly windowRepo: MaintenanceWindowRepository,
    @Inject(CONFIG_CACHE)
    private readonly cache: ConfigCache,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  @Get('status')
  @GetMaintenanceStatusSwagger()
  async status() {
    const data = await this.getMaintenanceStatus.execute();
    return SuccessResponseBuilder.build(data);
  }

  @Post('mode')
  @HttpCode(HttpStatus.OK)
  @SetMaintenanceModeSwagger()
  async setMode(@Body() dto: SetMaintenanceModeDto) {
    const data = await this.setMaintenanceMode.execute(dto);
    return SuccessResponseBuilder.build(data);
  }

  @Post('readonly')
  @HttpCode(HttpStatus.OK)
  @SetReadOnlyModeSwagger()
  async setReadOnly(@Body() dto: SetMaintenanceModeDto) {
    const existing = await this.configRepo.findByKey(READONLY_KEY);
    let config: AppConfig;

    if (existing) {
      existing.setValue(dto.enabled ? 'true' : 'false', dto.updatedBy);
      config = await this.configRepo.save(existing);
    } else {
      config = await this.configRepo.save(new AppConfig({
        id: randomUUID(),
        key: READONLY_KEY,
        value: dto.enabled ? 'true' : 'false',
        description: 'Modo solo-lectura global',
        category: ConfigCategory.MAINTENANCE,
        updatedBy: dto.updatedBy ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    await this.cache.del(`config:${READONLY_KEY}`);
    await this.auditLogger.log({
      action: dto.enabled ? 'READONLY_MODE_ENABLED' : 'READONLY_MODE_DISABLED',
      resource: 'AppConfig',
      resourceId: READONLY_KEY,
      performedBy: dto.updatedBy,
    });

    return SuccessResponseBuilder.build({ enabled: config.isEnabled(), updatedAt: config.updatedAt, message: null });
  }

  @Post('windows')
  @ScheduleMaintenanceWindowSwagger()
  async schedule(@Body() dto: ScheduleMaintenanceWindowDto) {
    const data = await this.scheduleWindow.execute(dto);
    return SuccessResponseBuilder.build(data);
  }

  @Get('windows')
  @GetMaintenanceWindowsSwagger()
  async listWindows(@Query('tenantId') tenantId?: string) {
    const windows = await this.windowRepo.findAll(tenantId ?? null);
    const data = windows.map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      startAt: w.startAt,
      endAt: w.endAt,
      tenantId: w.tenantId,
      isActive: w.isActive,
      createdAt: w.createdAt,
    }));
    return SuccessResponseBuilder.build(data);
  }

  @Delete('windows/:id')
  @CancelMaintenanceWindowSwagger()
  async cancelWindow(@Param('id') id: string) {
    const window = await this.windowRepo.findById(id);
    if (!window) throw DomainErrorFactory.maintenanceWindowNotFound(id);
    window.cancel();
    const saved = await this.windowRepo.save(window);
    return SuccessResponseBuilder.build({
      id: saved.id, title: saved.title, isActive: saved.isActive,
    });
  }
}
