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
    ApiConflictResponse({ description: 'Ya existe una compañía con ese NIT en el mismo país.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}

/** Swagger para `GET /v1/companies` (compañías del usuario autenticado) */
export function ListMyCompaniesGatewaySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar las compañías a las que pertenece el usuario autenticado',
      description:
        'Incluye membresías en cualquier estado (INVITED, ACTIVE, SUSPENDED), no solo activas.',
    }),
    ApiOkResponse({ description: 'Compañías del usuario, con su rol y estado en cada una.' }),
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

/** Swagger para `PATCH /v1/companies/:id` */
export function UpdateCompanyGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar el perfil de la compañía' }),
    ApiOkResponse({ description: 'Compañía actualizada.' }),
    ApiBadRequestResponse({ description: 'Datos inválidos.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'Solo OWNER/MANAGER pueden editar el perfil.' }),
    ApiNotFoundResponse({ description: 'Compañía no encontrada.' }),
    ApiConflictResponse({ description: 'Ya existe una compañía con ese NIT en el mismo país.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}

/** Swagger para `DELETE /v1/companies/:id` */
export function DeleteCompanyGatewaySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar una compañía completa',
      description:
        'Operación irreversible: solo un OWNER activo puede ejecutarla. Las membresías se eliminan en cascada.',
    }),
    ApiOkResponse({ description: 'Compañía eliminada.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'Solo un OWNER activo puede eliminar la compañía.' }),
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

/** Swagger para `DELETE /v1/companies/:id/logo` */
export function RemoveCompanyLogoGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Quitar el logo de la compañía sin reemplazarlo' }),
    ApiOkResponse({ description: 'Logo eliminado (o la compañía ya no tenía uno).' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'Solo OWNER/MANAGER pueden gestionar el logo.' }),
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
    ApiOperation({ summary: 'Listar los miembros de una compañía (paginado, con filtros)' }),
    ApiOkResponse({ description: 'Página de membresías.' }),
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
    ApiConflictResponse({ description: 'La compañía debe conservar al menos un OWNER activo.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}

/** Swagger para `POST /v1/companies/:id/members/:membershipId/accept` */
export function AcceptInvitationGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Aceptar la invitación propia a la compañía' }),
    ApiOkResponse({ description: 'Invitación aceptada, membresía queda ACTIVE.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({
      description: 'La membresía no existe o no pertenece al usuario autenticado.',
    }),
    ApiConflictResponse({ description: 'La membresía ya no está pendiente de aceptación.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}

/** Swagger para `POST /v1/companies/:id/members/:membershipId/decline` */
export function DeclineInvitationGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Rechazar la invitación propia a la compañía' }),
    ApiOkResponse({ description: 'Invitación rechazada; la membresía se elimina.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({
      description: 'La membresía no existe o no pertenece al usuario autenticado.',
    }),
    ApiConflictResponse({ description: 'La membresía ya no está pendiente de aceptación.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}

/** Swagger para `DELETE /v1/companies/:id/members/:membershipId` */
export function RemoveCompanyMemberGatewaySwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un miembro de la compañía',
      description:
        'Un miembro siempre puede eliminarse a sí mismo (salir). OWNER/MANAGER puede eliminar a otros o cancelar invitaciones pendientes; un MANAGER no puede eliminar a un OWNER.',
    }),
    ApiOkResponse({ description: 'Miembro eliminado.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({
      description: 'El solicitante no tiene permisos para eliminar a este miembro.',
    }),
    ApiNotFoundResponse({ description: 'Compañía o membresía no encontrada.' }),
    ApiConflictResponse({ description: 'La compañía debe conservar al menos un OWNER activo.' }),
    ApiServiceUnavailableResponse({ description: 'Company-service no disponible.' }),
  );
}
