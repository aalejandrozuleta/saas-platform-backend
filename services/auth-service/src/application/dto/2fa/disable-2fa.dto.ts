import { IsString, MinLength, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para desactivar la verificación en dos pasos (2FA) de la cuenta.
 *
 * @remarks
 * Exige tanto la contraseña actual como un código TOTP vigente para
 * confirmar la identidad del usuario antes de reducir el nivel de
 * seguridad de la cuenta.
 */
export class Disable2faDto {
  @ApiProperty({
    example: 'CurrentPass123!',
    description: 'Contraseña actual del usuario',
    minLength: 12,
  })
  @IsString()
  @MinLength(12)
  password!: string;

  @ApiProperty({
    example: '123456',
    description: 'Código TOTP de 6 dígitos para confirmar desactivación',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  totpCode!: string;
}
