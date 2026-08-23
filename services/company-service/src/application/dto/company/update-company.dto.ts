import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { ISO_COUNTRY_CODES } from './iso-country-codes';

/** Dígitos, espacios, guiones, paréntesis y un `+` inicial opcional (formato flexible internacional). */
const PHONE_REGEX = /^\+?[0-9()\-\s]{7,20}$/;

/**
 * DTO para actualizar el perfil de una empresa. Todos los campos son
 * opcionales: solo se actualizan los que llegan en el body (ver
 * `Company.updateProfile`). `plan`, `subscriptionStatus`, `logoUrl` y los
 * campos de Stripe no se exponen aquí — `logoUrl` tiene su propio endpoint
 * (`POST /:id/logo`) y el resto son de billing, fuera del alcance de este DTO.
 */
export class UpdateCompanyDto {
  @ApiPropertyOptional({
    example: 'Distribuidora El Sol S.A.S.',
    description: 'Nombre de la empresa',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ example: '900123456-7', description: 'NIT / identificación tributaria' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({
    example: 'contacto@elsol.com',
    description: 'Email de contacto de la empresa',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+57 3001234567',
    description: 'Teléfono de contacto de la empresa',
  })
  @IsOptional()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'phone must be a valid phone number' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'Calle 123 # 45-67',
    description: 'Dirección física de la empresa',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ example: 'Bogotá', description: 'Ciudad donde opera la empresa' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    example: 'CO',
    enum: ISO_COUNTRY_CODES,
    description: 'País donde opera la empresa (código ISO 3166-1 alpha-2)',
  })
  @IsOptional()
  @IsIn(ISO_COUNTRY_CODES)
  country?: string;
}
