import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { successResponse } from '@saas/shared';
import { SetMaintenanceModeUseCase } from '@application/use-cases/set-maintenance-mode.use-case';
import { GetMaintenanceStatusUseCase } from '@application/use-cases/get-maintenance-status.use-case';
import { ScheduleMaintenanceWindowUseCase } from '@application/use-cases/schedule-maintenance-window.use-case';
import { SetMaintenanceModeDto } from '@application/dto/maintenance/set-maintenance-mode.dto';
import { ScheduleMaintenanceWindowDto } from '@application/dto/maintenance/schedule-maintenance-window.dto';
import { MAINTENANCE_WINDOW_REPOSITORY } from '@domain/token/repositories.tokens';
import type { MaintenanceWindowRepository } from '@domain/repositories/maintenance-window.repository';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import {
  GetMaintenanceStatusSwagger,
  SetMaintenanceModeSwagger,
  ScheduleMaintenanceWindowSwagger,
  GetMaintenanceWindowsSwagger,
  CancelMaintenanceWindowSwagger,
} from '@infrastructure/swagger/maintenance.swagger';

@ApiTags('Maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(
    private readonly setMaintenanceMode: SetMaintenanceModeUseCase,
    private readonly getMaintenanceStatus: GetMaintenanceStatusUseCase,
    private readonly scheduleWindow: ScheduleMaintenanceWindowUseCase,
    @Inject(MAINTENANCE_WINDOW_REPOSITORY)
    private readonly windowRepo: MaintenanceWindowRepository,
  ) {}

  @Get('status')
  @GetMaintenanceStatusSwagger()
  async status() {
    const data = await this.getMaintenanceStatus.execute();
    return successResponse(data);
  }

  @Post('mode')
  @HttpCode(HttpStatus.OK)
  @SetMaintenanceModeSwagger()
  async setMode(@Body() dto: SetMaintenanceModeDto) {
    const data = await this.setMaintenanceMode.execute(dto);
    return successResponse(data);
  }

  @Post('windows')
  @ScheduleMaintenanceWindowSwagger()
  async schedule(@Body() dto: ScheduleMaintenanceWindowDto) {
    const data = await this.scheduleWindow.execute(dto);
    return successResponse(data);
  }

  @Get('windows')
  @GetMaintenanceWindowsSwagger()
  async listWindows() {
    const windows = await this.windowRepo.findAll();
    const data = windows.map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      startAt: w.startAt,
      endAt: w.endAt,
      isActive: w.isActive,
      createdAt: w.createdAt,
    }));
    return successResponse(data);
  }

  @Delete('windows/:id')
  @CancelMaintenanceWindowSwagger()
  async cancelWindow(@Param('id') id: string) {
    const window = await this.windowRepo.findById(id);
    if (!window) throw DomainErrorFactory.maintenanceWindowNotFound(id);
    window.cancel();
    const saved = await this.windowRepo.save(window);
    return successResponse({ id: saved.id, title: saved.title, isActive: saved.isActive });
  }
}
