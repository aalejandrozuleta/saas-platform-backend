import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Payload para programar una nueva ventana de mantenimiento.
 *
 * @remarks
 * `endAt` debe ser posterior a `startAt` y el rango no puede solaparse con
 * otra ventana activa existente; ambas reglas se validan en
 * `ScheduleMaintenanceWindowUseCase`, no a nivel de DTO.
 */
export class ScheduleMaintenanceWindowDto {
  @ApiProperty({ example: 'Migración de base de datos' })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Actualización a PostgreSQL 17' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: '2025-12-01T02:00:00Z' })
  @IsDateString()
  startAt!: string;

  @ApiProperty({ example: '2025-12-01T04:00:00Z' })
  @IsDateString()
  endAt!: string;

  @ApiPropertyOptional({ description: 'ID del super-admin que programa la ventana' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

/** Representación pública de una ventana de mantenimiento persistida. */
export class MaintenanceWindowResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional() description!: string | null;
  @ApiProperty() startAt!: Date;
  @ApiProperty() endAt!: Date;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdAt!: Date;
}
