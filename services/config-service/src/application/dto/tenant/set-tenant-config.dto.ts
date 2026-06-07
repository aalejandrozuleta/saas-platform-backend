import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PlanType } from '@domain/enums/plan-type.enum';

export class SetTenantConfigDto {
  @ApiProperty({ example: 'tenant-abc' })
  @IsString()
  tenantId!: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'https://acme.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'es', description: 'Código de idioma ISO 639-1' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'America/Bogota' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ enum: PlanType, example: PlanType.PRO })
  @IsOptional()
  @IsEnum(PlanType)
  plan?: PlanType;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxUsers?: number;

  @ApiPropertyOptional({ example: 10240, description: 'Almacenamiento máximo en MB' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxStorage?: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  customData?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TenantConfigResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() tenantId!: string;
  @ApiPropertyOptional() name!: string | null;
  @ApiPropertyOptional() logoUrl!: string | null;
  @ApiProperty() language!: string;
  @ApiProperty() timezone!: string;
  @ApiProperty({ enum: PlanType }) plan!: PlanType;
  @ApiProperty() maxUsers!: number;
  @ApiProperty() maxStorage!: number;
  @ApiPropertyOptional({ type: Object }) customData!: Record<string, unknown> | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
