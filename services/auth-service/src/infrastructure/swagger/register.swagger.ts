import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { RegisterUserResponseDto } from '@application/dto/register/register-user-response.dto';

/**
 * Decorador Swagger para el endpoint `POST /register`.
 *
 * @remarks
 * Crea un nuevo usuario en el sistema.
 * Si se envía un `x-device-fingerprint`, el dispositivo queda registrado como confiable.
 *
 * Siempre responde 201, incluso si el email ya está registrado — no expone
 * un 409 diferenciado para evitar enumeración de cuentas por email.
 */
export function RegisterSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Registrar usuario' }),
    ApiCreatedResponse({
      description:
        'Solicitud aceptada. Si el email no estaba registrado, se crea la cuenta y se envía un correo de verificación; si ya existía, la respuesta es idéntica pero no se realiza ninguna acción (evita enumeración de cuentas).',
      type: RegisterUserResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Datos de entrada inválidos (email mal formado, contraseña débil, etc.).',
    }),
  );
}
