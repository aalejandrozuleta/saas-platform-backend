import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddTrustedCountryDto {
  @ApiProperty({ example: 'CO', description: 'Código de país ISO 3166-1 alpha-2' })
  @IsString()
  @Length(2, 2)
  @Matches(/^[A-Z]{2}$/, { message: 'country must be a valid ISO 3166-1 alpha-2 code (e.g. CO, US, MX)' })
  country!: string;
}
