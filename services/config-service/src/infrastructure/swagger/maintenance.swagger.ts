import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { MaintenanceStatusDto } from '@application/dto/maintenance/maintenance-status.dto';
import { SetMaintenanceModeResponseDto } from '@application/dto/maintenance/set-maintenance-mode.dto';
import { MaintenanceWindowResponseDto } from '@application/dto/maintenance/schedule-maintenance-window.dto';

export function GetMaintenanceStatusSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Estado actual de mantenimiento y modo solo-lectura' }),
    ApiOkResponse({ type: MaintenanceStatusDto }),
  );
}

export function SetMaintenanceModeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Activar/desactivar modo mantenimiento global' }),
    ApiOkResponse({ type: SetMaintenanceModeResponseDto }),
    ApiBadRequestResponse({ description: 'Datos de entrada inválidos' }),
  );
}


export function ScheduleMaintenanceWindowSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Programar una ventana de mantenimiento' }),
    ApiCreatedResponse({ type: MaintenanceWindowResponseDto }),
    ApiBadRequestResponse({ description: 'Rango de fechas inválido' }),
    ApiConflictResponse({ description: 'Ya existe una ventana en ese rango' }),
  );
}

export function GetMaintenanceWindowsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar ventanas de mantenimiento' }),
    ApiOkResponse({ type: [MaintenanceWindowResponseDto] }),
  );
}

export function CancelMaintenanceWindowSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cancelar una ventana de mantenimiento programada' }),
    ApiOkResponse({ type: MaintenanceWindowResponseDto }),
  );
}
