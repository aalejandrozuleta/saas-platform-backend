import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiParam } from '@nestjs/swagger';

/**
 * Decorador Swagger para el endpoint `GET /sessions`.
 *
 * @remarks
 * Lista las sesiones activas del usuario autenticado, marcando con
 * `isCurrent` la sesión asociada al access token de la petición.
 */
export function GetSessionsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar sesiones activas del usuario autenticado' }),
    ApiOkResponse({
      description: 'Lista de sesiones activas. `isCurrent: true` marca la sesión actual.',
      schema: {
        example: {
          success: true,
          data: {
            sessions: [
              {
                id: 'uuid',
                isCurrent: true,
                ipAddress: '203.0.113.1',
                country: 'CO',
                startedAt: '2026-06-26T20:00:00.000Z',
                device: {
                  name: null,
                  os: null,
                  browser: null,
                  isTrusted: true,
                  lastUsedAt: '2026-06-26T21:00:00.000Z',
                },
              },
            ],
          },
        },
      },
    }),
  );
}

/**
 * Decorador Swagger para el endpoint `DELETE /sessions/:sessionId`.
 *
 * @remarks
 * Revoca una sesión específica del usuario autenticado (no necesariamente
 * la actual), útil para cerrar sesión en un dispositivo remoto.
 */
export function RevokeSessionSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Revocar una sesión activa por ID' }),
    ApiParam({ name: 'sessionId', description: 'ID de la sesión a cerrar' }),
    ApiOkResponse({ description: 'Sesión cerrada correctamente.' }),
    ApiNotFoundResponse({ description: 'La sesión no existe o no pertenece al usuario.' }),
  );
}
