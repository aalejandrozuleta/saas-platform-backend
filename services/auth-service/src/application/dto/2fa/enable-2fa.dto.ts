import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Enable2faDto {
  @ApiProperty({
    example: 'CurrentPass123!',
    description: 'Contraseña actual del usuario para confirmar identidad',
    minLength: 12,
  })
  @IsString()
  @MinLength(12)
  password!: string;
}
