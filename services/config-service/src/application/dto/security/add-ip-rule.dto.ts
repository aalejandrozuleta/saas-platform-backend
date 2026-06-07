import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { IpRuleType } from '@domain/enums/ip-rule-type.enum';

export class AddIpRuleDto {
  @ApiProperty({ example: '192.168.1.1', description: 'IP individual o inicio de rango CIDR' })
  @IsString()
  ip!: string;

  @ApiPropertyOptional({ example: '192.168.1.0/24', description: 'Rango CIDR opcional' })
  @IsOptional()
  @IsString()
  cidr?: string;

  @ApiProperty({ enum: IpRuleType, example: IpRuleType.BLACKLIST })
  @IsEnum(IpRuleType)
  type!: IpRuleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ example: 'Intentos de fuerza bruta detectados' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z', description: 'Expira en esta fecha; null = permanente' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class IpRuleResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() ip!: string;
  @ApiPropertyOptional() cidr!: string | null;
  @ApiProperty({ enum: IpRuleType }) type!: IpRuleType;
  @ApiPropertyOptional() tenantId!: string | null;
  @ApiPropertyOptional() reason!: string | null;
  @ApiPropertyOptional() expiresAt!: Date | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdAt!: Date;
}
