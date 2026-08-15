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
