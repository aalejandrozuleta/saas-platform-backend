import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para crear una empresa (tenant). Quien la crea queda como `OWNER`.
 */
export class CreateCompanyDto {
  @ApiProperty({ example: 'Distribuidora El Sol S.A.S.', description: 'Nombre de la empresa' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ example: '900123456-7', description: 'NIT / identificación tributaria' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;
}
