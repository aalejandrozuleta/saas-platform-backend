import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { FeatureFlagResponseDto } from '@application/dto/feature-flag/set-feature-flag.dto';

/**
 * Decoradores Swagger para el endpoint de creación/actualización de un feature flag.
 * Documenta la respuesta OK y el caso de clave inválida.
 */
export function SetFeatureFlagSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear o actualizar un feature flag' }),
    ApiOkResponse({ type: FeatureFlagResponseDto }),
    ApiBadRequestResponse({ description: 'Clave inválida o formato incorrecto' }),
  );
}

/** Decoradores Swagger para el listado de feature flags con filtros opcionales. */
export function GetFeatureFlagsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar todos los feature flags con filtros opcionales' }),
    ApiOkResponse({ type: [FeatureFlagResponseDto] }),
  );
}

/** Decoradores Swagger para la eliminación de un feature flag, incluyendo el caso "no encontrado". */
export function DeleteFeatureFlagSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un feature flag por ID' }),
    ApiOkResponse({ description: 'Flag eliminado correctamente' }),
    ApiNotFoundResponse({ description: 'Flag no encontrado' }),
  );
}
