import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResendVerificationDto } from '@application/dto/resend-verification/resend-verification.dto';

export function ResendVerificationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Reenvía el email de verificación (útil para usuarios pre-registro)' }),
    ApiBody({ type: ResendVerificationDto }),
    ApiResponse({ status: 200, description: 'Email de verificación enviado si la cuenta existe y no está verificada' }),
    ApiResponse({ status: 409, description: 'El email ya está verificado' }),
    HttpCode(HttpStatus.OK),
  );
}
