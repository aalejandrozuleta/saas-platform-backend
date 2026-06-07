import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SetMaintenanceModeDto {
  @ApiProperty({ description: 'Activa o desactiva el modo mantenimiento', example: true })
  @IsBoolean()
  enabled!: boolean;

  @ApiPropertyOptional({ description: 'Mensaje personalizado para los usuarios', example: 'Sistema en mantenimiento, volvemos a las 18:00' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiPropertyOptional({ description: 'ID del usuario que realiza el cambio' })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class SetMaintenanceModeResponseDto {
  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  message!: string | null;

  @ApiProperty()
  updatedAt!: Date;
}
