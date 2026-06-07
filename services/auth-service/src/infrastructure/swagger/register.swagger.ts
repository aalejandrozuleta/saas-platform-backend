import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { RegisterUserResponseDto } from '@application/dto/register/register-user-response.dto';

/**
 * Decorador Swagger para el endpoint `POST /register`.
 *
 * @remarks
 * Crea un nuevo usuario en el sistema.
 * Si se envía un `x-device-fingerprint`, el dispositivo queda registrado como confiable.
 */
export function RegisterSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Registrar usuario' }),
    ApiCreatedResponse({
      description: 'Usuario registrado correctamente.',
      type: RegisterUserResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Datos de entrada inválidos (email mal formado, contraseña débil, etc.).',
    }),
    ApiConflictResponse({
      description: 'El email ya está registrado.',
    }),
  );
}