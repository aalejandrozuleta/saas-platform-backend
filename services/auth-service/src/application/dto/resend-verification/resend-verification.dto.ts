import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/**
 * DTO para solicitar el reenvío del correo de verificación de cuenta.
 */
export class ResendVerificationDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Correo electrónico de la cuenta a verificar',
  })
  @IsEmail()
  email!: string;
}
