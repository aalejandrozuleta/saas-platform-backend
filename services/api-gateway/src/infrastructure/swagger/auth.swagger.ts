import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse,
  ApiServiceUnavailableResponse,
  ApiParam,
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

/** Swagger para `POST /auth/2fa/enable` */
export function Enable2faGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Iniciar activación de 2FA (TOTP)' }),
    ApiCreatedResponse({
      description: 'Secreto TOTP generado. Escanea el QR con tu app y confirma con /2fa/verify.',
    }),
    ApiUnauthorizedResponse({
      description: 'Contraseña incorrecta o sesión inválida.',
    }),
    ApiConflictResponse({
      description: '2FA ya está habilitado para este usuario.',
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth-service no disponible.',
    }),
  );
}

/** Swagger para `POST /auth/2fa/verify` */
export function Verify2faGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Confirmar código TOTP y activar 2FA' }),
    ApiOkResponse({
      description: '2FA activado. Se devuelven los códigos de recuperación de un solo uso.',
    }),
    ApiUnauthorizedResponse({
      description: 'Código TOTP inválido o expirado.',
    }),
    ApiUnprocessableEntityResponse({
      description: 'Setup de 2FA no iniciado. Llama primero a /2fa/enable.',
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth-service no disponible.',
    }),
  );
}

/** Swagger para `POST /auth/2fa/disable` */
export function Disable2faGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Desactivar 2FA del usuario autenticado' }),
    ApiOkResponse({
      description: '2FA desactivado. Secreto y códigos de recuperación eliminados.',
    }),
    ApiUnauthorizedResponse({
      description: 'Contraseña o código TOTP incorrecto.',
    }),
    ApiUnprocessableEntityResponse({
      description: '2FA no está habilitado para este usuario.',
    }),
    ApiServiceUnavailableResponse({
      description: 'Auth-service no disponible.',
    }),
  );
}

/** Swagger para `GET /auth/trusted-countries` */
export function GetTrustedCountriesGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar países de confianza del usuario autenticado' }),
    ApiOkResponse({
      description: 'Lista de códigos ISO 3166-1 alpha-2.',
      schema: { example: { success: true, data: { countries: ['CO', 'US'] } } },
    }),
    ApiServiceUnavailableResponse({ description: 'Auth-service no disponible.' }),
  );
}

/** Swagger para `POST /auth/trusted-countries` */
export function AddTrustedCountryGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Agregar un país de confianza (máx. 2)' }),
    ApiCreatedResponse({ description: 'País agregado correctamente.' }),
    ApiConflictResponse({ description: 'El país ya está en la lista.' }),
    ApiUnprocessableEntityResponse({ description: 'Límite de 2 países alcanzado.' }),
    ApiServiceUnavailableResponse({ description: 'Auth-service no disponible.' }),
  );
}

/** Swagger para `DELETE /auth/trusted-countries/:country` */
export function RemoveTrustedCountryGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un país de la lista de confianza' }),
    ApiParam({ name: 'country', example: 'CO', description: 'Código ISO 3166-1 alpha-2' }),
    ApiOkResponse({ description: 'País eliminado correctamente.' }),
    ApiNotFoundResponse({ description: 'El país no está en la lista.' }),
    ApiServiceUnavailableResponse({ description: 'Auth-service no disponible.' }),
  );
}
