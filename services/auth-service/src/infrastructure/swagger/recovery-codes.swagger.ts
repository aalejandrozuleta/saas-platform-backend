import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Verify2faResponseDto } from '@application/dto/2fa/verify-2fa-response.dto';

/**
 * Decorador Swagger para el endpoint `POST /2fa/recovery-codes/regenerate`.
 *
 * @remarks
 * Exige contraseña + TOTP vigente. Invalida por completo el lote de
 * recovery codes anterior y devuelve uno nuevo (solo se muestra una vez).
 */
export function RegenerateRecoveryCodesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Regenerar el lote de recovery codes de 2FA' }),
    ApiOkResponse({
      description: 'Nuevo lote de recovery codes generado. El anterior queda invalidado.',
      type: Verify2faResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Contraseña o código TOTP incorrecto.',
    }),
    ApiUnprocessableEntityResponse({
      description: '2FA no está habilitado para este usuario.',
    }),
  );
}
