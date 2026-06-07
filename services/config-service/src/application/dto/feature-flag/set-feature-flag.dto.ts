import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class SetFeatureFlagDto {
  @ApiProperty({ example: 'new_dashboard', description: 'Clave única del flag (snake_case)' })
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/, { message: 'key must be snake_case' })
  @MaxLength(100)
  key!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  enabled!: boolean;

  @ApiPropertyOptional({ example: 'tenant-abc' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ example: 'admin' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: 'production' })
  @IsOptional()
  @IsString()
  environment?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class FeatureFlagResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() key!: string;
  @ApiProperty() enabled!: boolean;
  @ApiPropertyOptional() tenantId!: string | null;
  @ApiPropertyOptional() role!: string | null;
  @ApiPropertyOptional() environment!: string | null;
  @ApiPropertyOptional() description!: string | null;
  @ApiPropertyOptional({ type: Object }) metadata!: Record<string, unknown> | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
