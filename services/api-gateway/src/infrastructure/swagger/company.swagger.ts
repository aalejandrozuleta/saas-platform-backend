import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiServiceUnavailableResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

/**
 * Decoradores Swagger para los endpoints de compañías/membresías del API
 * Gateway. Los datos viven físicamente en company-service (reenviados vía
 * `CompanyProxy`), pero se exponen en el gateway bajo el contrato público
 * `/companies` (`CompanyController`).
 */

/** Swagger para `POST /v1/companies` */
export function CreateCompanyGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear una compañía; el usuario autenticado queda como OWNER' }),
    ApiCreatedResponse({ description: 'Compañía creada.' }),
    ApiBadRequestResponse({ description: 'Datos inválidos.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}

/** Swagger para `GET /v1/companies/:id` */
export function GetCompanyGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener una compañía por id' }),
    ApiOkResponse({ description: 'Compañía encontrada.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'El usuario no tiene membresía activa en la compañía.' }),
    ApiNotFoundResponse({ description: 'Compañía no encontrada.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}

/** Swagger para `POST /v1/companies/:id/logo` */
export function UploadCompanyLogoGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Subir/reemplazar el logo de la compañía' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: { file: { type: 'string', format: 'binary' } },
      },
    }),
    ApiOkResponse({ description: 'Logo actualizado.' }),
    ApiBadRequestResponse({ description: 'Formato de imagen no soportado.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'Solo OWNER/MANAGER pueden actualizar el logo.' }),
    ApiNotFoundResponse({ description: 'Compañía no encontrada.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}

/** Swagger para `POST /v1/companies/:id/workers` */
export function RegisterWorkerGatewaySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar (provisionar) un trabajador nuevo directamente en la compañía',
    }),
    ApiCreatedResponse({ description: 'Trabajador provisionado y membresía creada como ACTIVE.' }),
    ApiBadRequestResponse({ description: 'Datos inválidos, o rol OWNER no permitido aquí.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'Solo OWNER/MANAGER pueden registrar trabajadores.' }),
    ApiNotFoundResponse({ description: 'Compañía no encontrada.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}

/** Swagger para `POST /v1/companies/:id/members` */
export function InviteCompanyMemberGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Invitar (por email) a un worker existente a la compañía' }),
    ApiCreatedResponse({ description: 'Membresía creada en estado INVITED.' }),
    ApiBadRequestResponse({ description: 'Datos inválidos.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'Solo OWNER/MANAGER pueden invitar miembros.' }),
    ApiNotFoundResponse({ description: 'No existe un usuario con ese email en auth-service.' }),
    ApiConflictResponse({ description: 'El usuario ya es miembro de la compañía.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}

/** Swagger para `GET /v1/companies/:id/members` */
export function ListCompanyMembersGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar los miembros de una compañía' }),
    ApiOkResponse({ description: 'Listado de membresías.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'El usuario no tiene membresía activa en la compañía.' }),
    ApiNotFoundResponse({ description: 'Compañía no encontrada.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}

/** Swagger para `PATCH /v1/companies/:id/members/:membershipId` */
export function UpdateCompanyMemberGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar el rol/estado de un miembro de la compañía' }),
    ApiOkResponse({ description: 'Membresía actualizada.' }),
    ApiBadRequestResponse({ description: 'Datos inválidos.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'Solo OWNER/MANAGER pueden actualizar miembros.' }),
    ApiNotFoundResponse({ description: 'Compañía o membresía no encontrada.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}
