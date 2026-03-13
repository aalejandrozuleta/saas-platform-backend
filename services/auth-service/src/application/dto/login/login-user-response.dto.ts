import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta al login de usuario
 */
export class LoginUserResponseDto {
  @ApiProperty({
    example: 'Inicio de sesion exitoso',
    description: 'Mensaje de login',
  })
  message!: string;

  @ApiProperty({
    example: {
      token: 'jwt-access-token',
    },
    description: 'Datos devueltos al iniciar sesión',
  })
  data!: {
    token: string;
  };
}
