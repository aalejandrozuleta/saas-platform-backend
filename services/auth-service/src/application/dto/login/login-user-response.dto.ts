import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta al login de usuario.
 * Los tokens NO se incluyen en el body — se envían en cookies HttpOnly (path=/v1/auth).
 */
export class LoginUserResponseDto {
  @ApiProperty({
    example: 'Inicio de sesión exitoso',
    description: 'Mensaje de confirmación',
  })
  message!: string;
}
