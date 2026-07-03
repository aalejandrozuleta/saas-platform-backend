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

/** Decoradores Swagger para consultar el estado actual de mantenimiento. */
export function GetMaintenanceStatusSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Estado actual de mantenimiento y modo solo-lectura' }),
    ApiOkResponse({ type: MaintenanceStatusDto }),
  );
}

/** Decoradores Swagger para activar/desactivar el modo mantenimiento global. */
export function SetMaintenanceModeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Activar/desactivar modo mantenimiento global' }),
    ApiOkResponse({ type: SetMaintenanceModeResponseDto }),
    ApiBadRequestResponse({ description: 'Datos de entrada inválidos' }),
  );
}

/**
 * Decoradores Swagger para programar una ventana de mantenimiento.
 * Documenta el conflicto cuando la ventana se solapa con otra ya existente.
 */
export function ScheduleMaintenanceWindowSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Programar una ventana de mantenimiento' }),
    ApiCreatedResponse({ type: MaintenanceWindowResponseDto }),
    ApiBadRequestResponse({ description: 'Rango de fechas inválido' }),
    ApiConflictResponse({ description: 'Ya existe una ventana en ese rango' }),
  );
}

/** Decoradores Swagger para listar las ventanas de mantenimiento. */
export function GetMaintenanceWindowsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar ventanas de mantenimiento' }),
    ApiOkResponse({ type: [MaintenanceWindowResponseDto] }),
  );
}

/** Decoradores Swagger para cancelar una ventana de mantenimiento programada. */
export function CancelMaintenanceWindowSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cancelar una ventana de mantenimiento programada' }),
    ApiOkResponse({ type: MaintenanceWindowResponseDto }),
  );
}
