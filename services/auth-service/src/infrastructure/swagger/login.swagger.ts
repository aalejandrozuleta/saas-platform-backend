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
 * Los tokens se devuelven en cookies HttpOnly (accessToken, refreshToken).
 * Requiere fingerprint de dispositivo en el header `x-device-fingerprint`.
 */
export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Autenticar usuario' }),
    ApiOkResponse({
      description: 'Login exitoso. Tokens enviados en cookies HttpOnly.',
      type: LoginUserResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Datos de entrada inválidos o fingerprint de dispositivo ausente.',
    }),
    ApiUnauthorizedResponse({
      description: 'Credenciales incorrectas.',
    }),
    ApiForbiddenResponse({
      description: 'Cuenta bloqueada por intentos fallidos, dispositivo no confiable o país no reconocido.',
    }),
  );
}