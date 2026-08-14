import { IsBoolean, IsString, MinLength, Equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear el perfil del usuario ("paso 2" del registro, posterior
 * a crear la cuenta con solo email/password).
 */
export class CreateUserProfileDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre(s)' })
  @IsString()
  @MinLength(1)
  firstName!: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido(s)' })
  @IsString()
  @MinLength(1)
  lastName!: string;

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
