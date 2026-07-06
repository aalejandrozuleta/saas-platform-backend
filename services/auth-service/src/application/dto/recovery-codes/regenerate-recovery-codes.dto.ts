import { IsString, MinLength, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para regenerar el lote de recovery codes de 2FA.
 *
 * @remarks
 * Exige contraseña + TOTP vigente, igual que `disable-2fa`: regenerar
 * invalida por completo el lote anterior.
 */
export class RegenerateRecoveryCodesDto {
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
    description: 'Código TOTP de 6 dígitos para confirmar la regeneración',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  totpCode!: string;
}
