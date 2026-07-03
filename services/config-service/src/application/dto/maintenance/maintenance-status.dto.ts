import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Estado consolidado de mantenimiento consultado por el resto de la
 * plataforma (API Gateway y otros microservicios) para decidir si deben
 * rechazar peticiones o entrar en modo solo-lectura.
 */
export class MaintenanceStatusDto {
  @ApiProperty({ description: '¿Está activo el modo mantenimiento?' })
  maintenanceEnabled!: boolean;

  @ApiProperty({ description: '¿Está activo el modo solo-lectura?' })
  readOnlyEnabled!: boolean;

  @ApiPropertyOptional({ description: 'Mensaje de mantenimiento personalizado' })
  maintenanceMessage!: string | null;

  @ApiPropertyOptional({
    description: 'Ventana de mantenimiento activa en este momento',
    type: Object,
  })
  activeWindow!: {
    id: string;
    title: string;
    startAt: Date;
    endAt: Date;
  } | null;
}
