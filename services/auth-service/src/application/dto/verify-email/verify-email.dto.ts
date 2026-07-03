import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para verificar el correo electrónico de una cuenta mediante el
 * token de 64 caracteres enviado por email al registrarse.
 */
export class VerifyEmailDto {
  @ApiProperty({
    example: 'a3f8e1b2c4d5e6f7a3f8e1b2c4d5e6f7a3f8e1b2c4d5e6f7a3f8e1b2c4d5e6f7',
    description: 'Token de verificación enviado al correo electrónico',
  })
  @IsString()
  @Length(64, 64)
  token!: string;
}
