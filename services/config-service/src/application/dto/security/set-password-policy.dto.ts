import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SetPasswordPolicyDto {
  @ApiPropertyOptional({ description: 'null = política global' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ example: 8, minimum: 6, maximum: 128 })
  @IsOptional()
  @IsInt()
  @Min(6)
  @Max(128)
  minLength?: number;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() requireUppercase?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requireLowercase?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requireNumbers?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requireSymbols?: boolean;

  @ApiPropertyOptional({ example: 90, description: 'Días antes de expirar la contraseña; null = sin expiración' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAgeDays?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  historyCount?: number;

  @ApiPropertyOptional({ example: 3, description: 'Sesiones simultáneas permitidas por usuario' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxConcurrentSessions?: number;
}

export class PasswordPolicyResponseDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional() tenantId!: string | null;
  @ApiProperty() minLength!: number;
  @ApiProperty() requireUppercase!: boolean;
  @ApiProperty() requireLowercase!: boolean;
  @ApiProperty() requireNumbers!: boolean;
  @ApiProperty() requireSymbols!: boolean;
  @ApiPropertyOptional() maxAgeDays!: number | null;
  @ApiProperty() historyCount!: number;
  @ApiProperty() maxConcurrentSessions!: number;
  @ApiProperty() updatedAt!: Date;
}
