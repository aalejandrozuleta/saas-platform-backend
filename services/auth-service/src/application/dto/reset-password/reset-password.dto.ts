import { IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO para completar la recuperación de contraseña con el token enviado por correo. */
export class ResetPasswordDto {
  @ApiProperty({
    example: 'a3f8e1b2c4d5e6f7a3f8e1b2c4d5e6f7a3f8e1b2c4d5e6f7a3f8e1b2c4d5e6f7',
    description: 'Token de recuperación enviado al correo electrónico',
  })
  @IsString()
  @Length(64, 64)
  token!: string;

  @ApiProperty({
    example: 'NewPass456@Secure',
    description: 'Nueva contraseña de la cuenta',
    minLength: 12,
  })
  @IsString()
  @MinLength(12)
  newPassword!: string;
}
