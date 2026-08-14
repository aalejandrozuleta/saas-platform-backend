import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ForgotPasswordDto } from '@application/dto/forgot-password/forgot-password.dto';

/**
 * Decorador Swagger para el endpoint `POST /forgot-password`.
 *
 * @remarks
 * Responde 200 tanto si la cuenta existe como si no, para evitar
 * enumeración de emails registrados.
 */
export function ForgotPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Solicita un enlace de recuperación de contraseña por email' }),
    ApiBody({ type: ForgotPasswordDto }),
    ApiResponse({
      status: 200,
      description: 'Email de recuperación enviado si la cuenta existe',
    }),
    HttpCode(HttpStatus.OK),
  );
}
