import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { FeatureFlagResponseDto } from '@application/dto/feature-flag/set-feature-flag.dto';

export function SetFeatureFlagSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear o actualizar un feature flag' }),
    ApiOkResponse({ type: FeatureFlagResponseDto }),
    ApiBadRequestResponse({ description: 'Clave inválida o formato incorrecto' }),
  );
}

export function GetFeatureFlagsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar todos los feature flags con filtros opcionales' }),
    ApiOkResponse({ type: [FeatureFlagResponseDto] }),
  );
}

export function DeleteFeatureFlagSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un feature flag por ID' }),
    ApiOkResponse({ description: 'Flag eliminado correctamente' }),
    ApiNotFoundResponse({ description: 'Flag no encontrado' }),
  );
}
