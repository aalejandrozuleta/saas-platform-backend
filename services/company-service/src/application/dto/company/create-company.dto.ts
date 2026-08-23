import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ISO_COUNTRY_CODES } from './iso-country-codes';

/** Dígitos, espacios, guiones, paréntesis y un `+` inicial opcional (formato flexible internacional). */
const PHONE_REGEX = /^\+?[0-9()\-\s]{7,20}$/;

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
  @Matches(PHONE_REGEX, { message: 'phone must be a valid phone number' })
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
    enum: ISO_COUNTRY_CODES,
    description: 'País donde opera la empresa (código ISO 3166-1 alpha-2). Default: CO',
  })
  @IsOptional()
  @IsIn(ISO_COUNTRY_CODES)
  country?: string;
}
