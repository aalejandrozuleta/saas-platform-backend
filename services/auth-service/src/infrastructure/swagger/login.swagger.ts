import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { LoginUserResponseDto } from '@application/dto/login/login-user-response.dto';

/**
 * Decorador Swagger para el endpoint `POST /login`.
 *
 * @remarks
 * Autentica un usuario con email y contraseña.
 *
 * Seguridad:
 * - Los tokens se devuelven en cookies HttpOnly con path=/v1/auth (no expuestos a JS).
 * - Requiere fingerprint de dispositivo en el header `x-device-fingerprint`.
 * - Tiempo de respuesta constante independientemente de si el email existe (anti-timing).
 * - Bloqueo progresivo: 5min → 15min → 30min → 60min tras intentos fallidos.
 * - Registra `lastLoginAt` en cada autenticación exitosa.
 */
export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Autenticar usuario' }),
    ApiOkResponse({
      description: 'Login exitoso. Tokens enviados en cookies HttpOnly (path=/v1/auth).',
      type: LoginUserResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Datos de entrada inválidos o fingerprint de dispositivo ausente.',
    }),
    ApiUnauthorizedResponse({
      description: 'Credenciales incorrectas (respuesta idéntica si el email no existe).',
    }),
    ApiForbiddenResponse({
      description: 'Cuenta bloqueada por intentos fallidos (bloqueo progresivo), dispositivo no confiable o país no reconocido.',
    }),
  );
}