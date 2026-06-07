import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'Aplica solo a este tenant; null = global' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class MaintenanceWindowResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiPropertyOptional() description!: string | null;
  @ApiProperty() startAt!: Date;
  @ApiProperty() endAt!: Date;
  @ApiPropertyOptional() tenantId!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdAt!: Date;
}
