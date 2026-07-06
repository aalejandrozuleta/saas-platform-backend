import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResetPasswordDto } from '@application/dto/reset-password/reset-password.dto';

/**
 * Decorador Swagger para el endpoint `POST /reset-password`.
 *
 * @remarks
 * Completa la recuperación de contraseña usando el token de un solo uso
 * enviado por email vía `forgot-password`.
 */
export function ResetPasswordSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Completa la recuperación de contraseña con el token enviado por email',
    }),
    ApiBody({ type: ResetPasswordDto }),
    ApiResponse({ status: 200, description: 'Contraseña actualizada correctamente' }),
    ApiResponse({ status: 400, description: 'Token inválido o expirado' }),
    ApiResponse({
      status: 422,
      description: 'La nueva contraseña no cumple los requisitos o es igual a la actual',
    }),
    HttpCode(HttpStatus.OK),
  );
}
