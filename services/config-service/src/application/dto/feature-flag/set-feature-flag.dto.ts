import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class SetFeatureFlagDto {
  @ApiProperty({
    example: 'auth-service',
    description: 'Nombre del servicio o módulo (snake-case o kebab-case)',
  })
  @IsString()
  @Matches(/^[a-z][a-z0-9_-]*$/, { message: 'key must be lowercase letters, numbers, hyphens or underscores' })
  @MaxLength(100)
  key!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  enabled!: boolean;

  @ApiPropertyOptional({
    example: 'production',
    description: 'Entorno al que aplica. null / omitido = todos los entornos.',
  })
  @IsOptional()
  @IsString()
  environment?: string;

  @ApiPropertyOptional({ description: 'Descripción opcional del flag' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'ID del usuario super-admin que realiza el cambio' })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class FeatureFlagResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() key!: string;
  @ApiProperty() enabled!: boolean;
  @ApiPropertyOptional() environment!: string | null;
  @ApiPropertyOptional() description!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
