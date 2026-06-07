import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiUnprocessableEntityResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';

/**
 * Decoradores Swagger para los endpoints de autenticación del API Gateway.
 *
 * @remarks
 * Cada función refleja los mismos contratos del auth-service más los errores
 * propios del gateway (503 por circuit breaker o servicio caído).
 */

/** Swagger para `POST /auth/register` */
export function RegisterGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Registrar usuario' }),
    ApiCreatedResponse({
      description: 'Usuario registrado correctamente.',
    }),
    ApiBadRequestResponse({
      description: 'Datos de entrada inválidos.',
    }),
    ApiConflictResponse({
      description: 'El email ya está registrado.',
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth-service no disponible (circuit breaker abierto).',
    }),
  );
}

/** Swagger para `POST /auth/login` */
export function LoginGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Autenticar usuario' }),
    ApiOkResponse({
      description: 'Login exitoso. Tokens enviados en cookies HttpOnly.',
    }),
    ApiBadRequestResponse({
      description: 'Datos inválidos o fingerprint de dispositivo ausente.',
    }),
    ApiUnauthorizedResponse({
      description: 'Credenciales incorrectas.',
    }),
    ApiForbiddenResponse({
      description: 'Cuenta bloqueada, dispositivo o país no reconocido.',
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth-service no disponible.',
    }),
  );
}

/** Swagger para `POST /auth/refresh` */
export function RefreshGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Renovar access token' }),
    ApiOkResponse({
      description: 'Access token renovado. Nuevo refreshToken en cookie.',
    }),
    ApiUnauthorizedResponse({
      description: 'Refresh token inválido, expirado o revocado.',
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth-service no disponible.',
    }),
  );
}

/** Swagger para `POST /auth/logout` */
export function LogoutGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cerrar sesión actual' }),
    ApiOkResponse({
      description: 'Sesión cerrada. Cookies de autenticación eliminadas.',
    }),
    ApiUnauthorizedResponse({
      description: 'Token de sesión inválido o expirado.',
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth-service no disponible.',
    }),
  );
}

/** Swagger para `POST /auth/logout-all` */
export function LogoutAllGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cerrar todas las sesiones activas' }),
    ApiOkResponse({
      description: 'Todas las sesiones revocadas.',
    }),
    ApiUnauthorizedResponse({
      description: 'Token de sesión inválido o expirado.',
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth-service no disponible.',
    }),
  );
}

/** Swagger para `POST /auth/change-password` */
export function ChangePasswordGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' }),
    ApiOkResponse({
      description: 'Contraseña actualizada. Todas las sesiones previas revocadas.',
    }),
    ApiUnauthorizedResponse({
      description: 'Contraseña actual incorrecta o sesión inválida.',
    }),
    ApiUnprocessableEntityResponse({
      description: 'La nueva contraseña es idéntica a la actual.',
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth-service no disponible.',
    }),
  );
}
