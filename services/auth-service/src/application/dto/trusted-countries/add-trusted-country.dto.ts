import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para agregar un país a la lista de países de confianza.
 *
 * @remarks
 * Un login desde un país marcado como confiable puede omitir
 * verificaciones adicionales de seguridad (por ejemplo, alertas de
 * ubicación inusual) que sí se disparan para países no registrados.
 */
export class AddTrustedCountryDto {
  @ApiProperty({ example: 'CO', description: 'Código de país ISO 3166-1 alpha-2' })
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, {
    message: 'country must be a valid ISO 3166-1 alpha-2 code (e.g. CO, US, MX)',
  })
  country!: string;
}
