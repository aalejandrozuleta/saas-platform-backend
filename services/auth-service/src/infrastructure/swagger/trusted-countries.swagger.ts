import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse,
  ApiParam,
} from '@nestjs/swagger';

export function GetTrustedCountriesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar países de confianza del usuario autenticado' }),
    ApiOkResponse({
      description: 'Lista de códigos de país ISO 3166-1 alpha-2.',
      schema: {
        example: { success: true, data: { countries: ['CO', 'US'] } },
      },
    }),
  );
}

export function AddTrustedCountrySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Agregar un país de confianza (máx. 2)' }),
    ApiCreatedResponse({
      description: 'País agregado correctamente.',
    }),
    ApiConflictResponse({
      description: 'El país ya está en la lista de confianza.',
    }),
    ApiUnprocessableEntityResponse({
      description: 'Se alcanzó el límite máximo de 2 países de confianza.',
    }),
  );
}

export function RemoveTrustedCountrySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar un país de la lista de confianza' }),
    ApiParam({ name: 'country', example: 'CO', description: 'Código ISO 3166-1 alpha-2' }),
    ApiOkResponse({
      description: 'País eliminado correctamente.',
    }),
    ApiNotFoundResponse({
      description: 'El país no está en la lista de confianza.',
    }),
  );
}
