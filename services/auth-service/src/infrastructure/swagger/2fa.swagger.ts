import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Enable2faResponseDto } from '@application/dto/2fa/enable-2fa-response.dto';
import { Verify2faResponseDto } from '@application/dto/2fa/verify-2fa-response.dto';

export function Enable2faSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Iniciar activación de 2FA (TOTP)' }),
    ApiCreatedResponse({
      description: 'Secreto TOTP generado. Escanea el QR con tu app autenticadora y confirma con /2fa/verify.',
      type: Enable2faResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Contraseña incorrecta.',
    }),
    ApiConflictResponse({
      description: '2FA ya está habilitado para este usuario.',
    }),
  );
}

export function Verify2faSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Confirmar código TOTP y activar 2FA' }),
    ApiOkResponse({
      description: '2FA activado correctamente. Se devuelven los códigos de recuperación de un solo uso.',
      type: Verify2faResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Código TOTP inválido o expirado.',
    }),
    ApiUnprocessableEntityResponse({
      description: 'El setup de 2FA no fue iniciado. Llama primero a /2fa/enable.',
    }),
  );
}

export function Disable2faSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Desactivar 2FA del usuario autenticado' }),
    ApiOkResponse({
      description: '2FA desactivado correctamente. Secreto y códigos de recuperación eliminados.',
    }),
    ApiUnauthorizedResponse({
      description: 'Contraseña o código TOTP incorrecto.',
    }),
    ApiUnprocessableEntityResponse({
      description: '2FA no está habilitado para este usuario.',
    }),
  );
}
