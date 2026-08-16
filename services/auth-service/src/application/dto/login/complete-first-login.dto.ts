import { IsBoolean, IsString, MinLength, Equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para `POST /auth/complete-first-login`: resuelve el challenge
 * `PASSWORD_CHANGE_REQUIRED` emitido por `/login` cuando un worker
 * provisionado por su empresa (`ProvisionWorkerUseCase`) inicia sesión con
 * su contraseña temporal por primera vez. Cambia la contraseña, registra
 * el consentimiento (nunca aceptado antes, ver
 * `UserProfile.createProvisioned()`) y completa el login en una sola
 * llamada.
 */
export class CompleteFirstLoginDto {
  @ApiProperty({
    description: 'Challenge token de corta duración recibido en la respuesta 403 del login',
  })
  @IsString()
  changeToken!: string;

  @ApiProperty({
    example: 'NewPass456@Secure',
    description: 'Nueva contraseña, en reemplazo de la contraseña temporal',
    minLength: 12,
  })
  @IsString()
  @MinLength(12)
  newPassword!: string;

  @ApiProperty({
    example: true,
    description:
      'Autorización de tratamiento de datos personales (Ley 1581 de 2012). Debe ser true.',
  })
  @IsBoolean()
  @Equals(true, { message: 'Debes aceptar el tratamiento de datos personales' })
  dataProcessingAccepted!: boolean;

  @ApiProperty({
    example: true,
    description: 'Aceptación de términos y condiciones. Debe ser true.',
  })
  @IsBoolean()
  @Equals(true, { message: 'Debes aceptar los términos y condiciones' })
  termsAccepted!: boolean;
}
