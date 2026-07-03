import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para iniciar la activación de la verificación en dos pasos (2FA).
 *
 * @remarks
 * Requiere la contraseña actual como reconfirmación de identidad
 * antes de generar el secreto TOTP.
 */
export class Enable2faDto {
  @ApiProperty({
    example: 'CurrentPass123!',
    description: 'Contraseña actual del usuario para confirmar identidad',
    minLength: 12,
  })
  @IsString()
  @MinLength(12)
  password!: string;
}
