import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/**
 * Decorador Swagger para el endpoint `POST /logout`.
 *
 * @remarks
 * Cierra la sesión actual del usuario autenticado e invalida
 * el access token y refresh token asociados.
 */
export function LogoutSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cerrar sesión actual' }),
    ApiOkResponse({
      description: 'Sesión cerrada correctamente',
    }),
    ApiUnauthorizedResponse({
      description: 'Token de sesión inválido o expirado',
    }),
  );
}

/**
 * Decorador Swagger para el endpoint `POST /logout-all`.
 *
 * @remarks
 * Cierra todas las sesiones activas del usuario,
 * invocando la revocación global de tokens.
 */
export function LogoutAllSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cerrar todas las sesiones activas' }),
    ApiOkResponse({
      description: 'Todas las sesiones cerradas correctamente',
    }),
    ApiUnauthorizedResponse({
      description: 'Token de sesión inválido o expirado',
    }),
  );
}
