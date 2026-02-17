import { IsEmail, IsString, MinLength } from 'class-validator';
/**
 * DTO de login de usuario
 */
export class LoginUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  password!: string;
}
