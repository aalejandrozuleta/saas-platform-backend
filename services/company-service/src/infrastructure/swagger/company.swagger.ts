import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CompanyResponseDto } from '@application/dto/company/company-response.dto';

/**
 * Decorador Swagger para `POST /companies`.
 */
export function CreateCompanySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear una empresa (el usuario autenticado queda como OWNER)',
    }),
    ApiCreatedResponse({ description: 'Empresa creada.', type: CompanyResponseDto }),
    ApiBadRequestResponse({ description: 'Datos inválidos.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
  );
}

/**
 * Decorador Swagger para `GET /companies/:id`.
 */
export function GetCompanySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener una empresa de la que el usuario es miembro' }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiOkResponse({ description: 'Datos de la empresa.', type: CompanyResponseDto }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({
      description: 'La empresa no existe o el usuario no es miembro activo de ella.',
    }),
  );
}

/**
 * Decorador Swagger para `POST /companies/:id/logo`.
 */
export function UploadCompanyLogoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Subir/reemplazar el logo de la empresa' }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: { file: { type: 'string', format: 'binary' } },
      },
    }),
    ApiOkResponse({ description: 'Logo actualizado.', type: CompanyResponseDto }),
    ApiBadRequestResponse({ description: 'Formato de imagen no soportado.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({
      description: 'El usuario no tiene permisos para gestionar el logo de esta empresa.',
    }),
    ApiNotFoundResponse({ description: 'La empresa no existe.' }),
  );
}
