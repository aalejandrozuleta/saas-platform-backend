import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'CurrentPass123!',
    description: 'Contraseña actual del usuario',
    minLength: 12,
  })
  @IsString()
  @MinLength(12)
  currentPassword!: string;

  @ApiProperty({
    example: 'NewPass456@Secure',
    description: 'Nueva contraseña del usuario',
    minLength: 12,
  })
  @IsString()
  @MinLength(12)
  newPassword!: string;
}
