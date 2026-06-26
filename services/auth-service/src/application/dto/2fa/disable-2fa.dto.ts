import { IsString, MinLength, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Disable2faDto {
  @ApiProperty({
    example: 'CurrentPass123!',
    description: 'Contraseña actual del usuario',
    minLength: 12,
  })
  @IsString()
  @MinLength(12)
  password!: string;

  @ApiProperty({
    example: '123456',
    description: 'Código TOTP de 6 dígitos para confirmar desactivación',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  totpCode!: string;
}
