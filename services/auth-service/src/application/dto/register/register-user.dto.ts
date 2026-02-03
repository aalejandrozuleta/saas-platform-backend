import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * DTO de registro de usuario
 */
export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  password!: string;
}
