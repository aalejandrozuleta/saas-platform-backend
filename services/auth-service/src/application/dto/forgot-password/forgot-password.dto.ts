import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/**
 * DTO para solicitar la recuperación de contraseña ("olvidé mi contraseña").
 */
export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico de la cuenta a recuperar',
  })
  @IsEmail()
  email!: string;
}
