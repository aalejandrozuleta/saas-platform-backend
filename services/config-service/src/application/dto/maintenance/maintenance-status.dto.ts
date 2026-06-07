import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MaintenanceStatusDto {
  @ApiProperty({ description: '¿Está activo el modo mantenimiento?' })
  maintenanceEnabled!: boolean;

  @ApiProperty({ description: '¿Está activo el modo solo-lectura?' })
  readOnlyEnabled!: boolean;

  @ApiPropertyOptional({ description: 'Mensaje de mantenimiento personalizado' })
  maintenanceMessage!: string | null;

  @ApiPropertyOptional({ description: 'Ventana de mantenimiento activa en este momento', type: Object })
  activeWindow!: {
    id: string;
    title: string;
    startAt: Date;
    endAt: Date;
  } | null;
}
