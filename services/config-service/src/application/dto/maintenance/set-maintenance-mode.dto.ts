import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Payload para activar/desactivar el modo mantenimiento global.
 *
 * @remarks
 * Afecta a toda la plataforma de forma inmediata: `SetMaintenanceModeUseCase`
 * invalida el caché que consulta el API Gateway en vez de esperar a que
 * expire por TTL.
 */
export class SetMaintenanceModeDto {
  @ApiProperty({ description: 'Activa o desactiva el modo mantenimiento', example: true })
  @IsBoolean()
  enabled!: boolean;

  @ApiPropertyOptional({
    description: 'Mensaje personalizado para los usuarios',
    example: 'Sistema en mantenimiento, volvemos a las 18:00',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiPropertyOptional({ description: 'ID del usuario que realiza el cambio' })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

/** Estado resultante tras aplicar el cambio de modo mantenimiento. */
export class SetMaintenanceModeResponseDto {
  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  message!: string | null;

  @ApiProperty()
  updatedAt!: Date;
}
