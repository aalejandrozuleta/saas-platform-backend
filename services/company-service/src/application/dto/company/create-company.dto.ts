import { IsEmail, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';
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

  @ApiProperty({ example: 'contacto@elsol.com', description: 'Email de contacto de la empresa' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+57 3001234567', description: 'Teléfono de contacto de la empresa' })
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ example: 'Calle 123 # 45-67', description: 'Dirección física de la empresa' })
  @IsString()
  @MaxLength(200)
  address!: string;

  @ApiProperty({ example: 'Bogotá', description: 'Ciudad donde opera la empresa' })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiPropertyOptional({
    example: 'CO',
    description: 'País donde opera la empresa (código ISO de 2 letras). Default: CO',
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  country?: string;
}
