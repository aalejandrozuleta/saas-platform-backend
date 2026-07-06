import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginUserResponseDto } from '@application/dto/login/login-user-response.dto';

/**
 * Decorador Swagger para el endpoint `POST /login/verify-2fa`.
 *
 * @remarks
 * Resuelve el challenge `SECURITY_CHALLENGE_REQUIRED` emitido por `/login`
 * usando el `challengeToken` recibido más un código TOTP o un recovery
 * code. Al tener éxito, completa el login (mismas cookies que `/login`) y
 * marca el dispositivo/país como confiables.
 */
export function VerifyLoginChallengeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Resolver el challenge de login con TOTP o recovery code' }),
    ApiOkResponse({
      description: 'Login completado. Tokens enviados en cookies HttpOnly (path=/v1/auth).',
      type: LoginUserResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'No se proporcionó ni totpCode ni recoveryCode.',
    }),
    ApiUnauthorizedResponse({
      description:
        'Challenge token inválido/expirado, código TOTP inválido o recovery code inválido/ya usado.',
    }),
  );
}
