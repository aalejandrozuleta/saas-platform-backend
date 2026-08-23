import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
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
    ApiConflictResponse({ description: 'Ya existe una empresa con ese NIT en el mismo país.' }),
  );
}

/**
 * Decorador Swagger para `GET /companies` (empresas del usuario autenticado).
 */
export function ListMyCompaniesSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar las empresas a las que pertenece el usuario autenticado',
      description:
        'Incluye membresías en cualquier estado (INVITED, ACTIVE, SUSPENDED), no solo activas, para que el usuario pueda ver y actuar sobre invitaciones pendientes.',
    }),
    ApiOkResponse({ description: 'Empresas del usuario, con su rol y estado en cada una.' }),
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
 * Decorador Swagger para `PATCH /companies/:id`.
 */
export function UpdateCompanySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar el perfil de la empresa' }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiOkResponse({ description: 'Empresa actualizada.', type: CompanyResponseDto }),
    ApiBadRequestResponse({ description: 'Datos inválidos.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({
      description: 'El usuario no tiene permisos para editar el perfil de esta empresa.',
    }),
    ApiNotFoundResponse({ description: 'La empresa no existe.' }),
    ApiConflictResponse({ description: 'Ya existe una empresa con ese NIT en el mismo país.' }),
  );
}

/**
 * Decorador Swagger para `DELETE /companies/:id`.
 */
export function DeleteCompanySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar una empresa completa',
      description:
        'Operación irreversible: solo un OWNER activo puede ejecutarla (MANAGER no basta). Todas las membresías se eliminan en cascada junto con la empresa.',
    }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiOkResponse({ description: 'Empresa eliminada.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'Solo un OWNER activo puede eliminar la empresa.' }),
    ApiNotFoundResponse({ description: 'La empresa no existe.' }),
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

/**
 * Decorador Swagger para `DELETE /companies/:id/logo`.
 */
export function RemoveCompanyLogoSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Quitar el logo de la empresa sin reemplazarlo' }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiOkResponse({
      description: 'Logo eliminado (o la empresa ya no tenía uno).',
      type: CompanyResponseDto,
    }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({
      description: 'El usuario no tiene permisos para gestionar el logo de esta empresa.',
    }),
    ApiNotFoundResponse({ description: 'La empresa no existe.' }),
  );
}
