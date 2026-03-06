import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta al registrar usuario
 */
export class RegisterUserResponseDto {
  @ApiProperty({
    example: 'uuid-del-usuario',
    description: 'ID del usuario creado',
  })
  id!: string;

  @ApiProperty({
    example: 'user@email.com',
    description: 'Email del usuario',
  })
  email!: string;
}