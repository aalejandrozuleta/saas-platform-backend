import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { RateLimitResponseDto } from '@application/dto/rate-limit/set-rate-limit.dto';

export function SetRateLimitSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Configurar rate limit para un endpoint' }),
    ApiOkResponse({ type: RateLimitResponseDto }),
    ApiBadRequestResponse({ description: 'Datos inválidos' }),
  );
}

export function GetRateLimitsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar rate limits configurados' }),
    ApiOkResponse({ type: [RateLimitResponseDto] }),
  );
}

export function DeleteRateLimitSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar configuración de rate limit por ID' }),
    ApiOkResponse({ description: 'Rate limit eliminado' }),
  );
}
