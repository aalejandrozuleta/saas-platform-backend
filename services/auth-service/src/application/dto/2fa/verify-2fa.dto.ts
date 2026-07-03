import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para confirmar la activación de 2FA validando el código TOTP
 * generado por la app autenticadora.
 */
export class Verify2faDto {
  @ApiProperty({
    example: '123456',
    description: 'Código TOTP de 6 dígitos generado por la app autenticadora',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  totpCode!: string;
}
