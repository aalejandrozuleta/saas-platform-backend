import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VerifyEmailDto } from '@application/dto/verify-email/verify-email.dto';

export function VerifyEmailSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Activa la cuenta verificando el token enviado por email' }),
    ApiBody({ type: VerifyEmailDto }),
    ApiResponse({ status: 200, description: 'Email verificado correctamente' }),
    ApiResponse({ status: 400, description: 'Token inválido o expirado' }),
    HttpCode(HttpStatus.OK),
  );
}
