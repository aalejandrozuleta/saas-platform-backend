import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de login de usuario
 */
export class LoginUserDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'PasswordSuperSeguro123',
    description: 'Contraseña del usuario',
    minLength: 12,
  })
  @IsString()
  @MinLength(12)
  password!: string;
}