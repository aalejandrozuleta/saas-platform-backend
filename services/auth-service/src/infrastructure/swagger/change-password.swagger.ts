import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

/**
 * Decorador Swagger para el endpoint `POST /change-password`.
 *
 * @remarks
 * Cambia la contraseña del usuario autenticado.
 * Al completarse, revoca todas las sesiones activas y los refresh tokens,
 * obligando a re-autenticarse en todos los dispositivos.
 */
export function ChangePasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' }),
    ApiOkResponse({
      description: 'Contraseña actualizada. Todas las sesiones previas quedan revocadas.',
    }),
    ApiUnauthorizedResponse({
      description: 'Contraseña actual incorrecta o usuario no autenticado.',
    }),
    ApiUnprocessableEntityResponse({
      description: 'La nueva contraseña es idéntica a la actual.',
    }),
  );
}
