import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta al login de usuario.
 * Los tokens NO se incluyen en el body — se envían en cookies HttpOnly (path=/v1/auth).
 *
 * `role` y `permissions` se incluyen para que el frontend pueda decidir qué
 * mostrar en la UI. No son la fuente de verdad de autorización: cada request
 * protegida se sigue validando server-side contra la sesión en Redis
 * (ver JwtSessionGuard), así que un cambio de permisos se refleja de
 * inmediato sin depender de que el cliente vuelva a hacer login.
 */
export class LoginUserResponseDto {
  @ApiProperty({
    example: 'Inicio de sesión exitoso',
    description: 'Mensaje de confirmación',
  })
  message!: string;

  @ApiProperty({
    example: 'SUPER_ADMIN',
    description: 'Rol del usuario autenticado',
  })
  role!: string;

  @ApiProperty({
    example: ['platform:maintenance', 'platform:feature-flags'],
    description: 'Permisos efectivos del usuario (rol + overrides), solo para gating de UI',
    type: [String],
  })
  permissions!: string[];
}
