import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class SetRateLimitDto {
  @ApiProperty({ example: '/api/auth/login', description: 'Patrón de ruta o endpoint' })
  @IsString()
  @MaxLength(200)
  endpoint!: string;

  @ApiProperty({ example: 10, description: 'Máximo de requests en la ventana de tiempo' })
  @IsInt()
  @Min(1)
  @Max(100_000)
  maxRequests!: number;

  @ApiProperty({ example: 60, description: 'Tamaño de la ventana en segundos' })
  @IsInt()
  @Min(1)
  @Max(86_400)
  windowSeconds!: number;

  @ApiPropertyOptional({ description: 'null = aplica globalmente' })
  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class RateLimitResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() endpoint!: string;
  @ApiProperty() maxRequests!: number;
  @ApiProperty() windowSeconds!: number;
  @ApiPropertyOptional() tenantId!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() updatedAt!: Date;
}
