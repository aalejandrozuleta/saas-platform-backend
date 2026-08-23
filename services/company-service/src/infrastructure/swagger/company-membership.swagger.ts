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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MembershipResponseDto } from '@application/dto/company-membership/membership-response.dto';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

/**
 * Decorador Swagger para `POST /companies/:id/workers`.
 */
export function RegisterWorkerSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar (provisionar) un trabajador nuevo directamente en la empresa',
    }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiCreatedResponse({
      description: 'Trabajador provisionado y membresía creada como ACTIVE.',
      type: MembershipResponseDto,
    }),
    ApiBadRequestResponse({ description: 'Datos inválidos, o rol OWNER no permitido aquí.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'El solicitante no es OWNER/MANAGER de la empresa.' }),
    ApiNotFoundResponse({ description: 'La empresa no existe.' }),
  );
}

/**
 * Decorador Swagger para `POST /companies/:id/members`.
 */
export function InviteMemberSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Invitar a un usuario ya registrado como miembro de la empresa',
    }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiCreatedResponse({ description: 'Invitación creada.', type: MembershipResponseDto }),
    ApiBadRequestResponse({ description: 'Datos inválidos.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'El solicitante no es OWNER/MANAGER de la empresa.' }),
    ApiNotFoundResponse({ description: 'No existe un usuario con ese email.' }),
    ApiConflictResponse({ description: 'Ese usuario ya es miembro de la empresa.' }),
  );
}

/**
 * Decorador Swagger para `GET /companies/:id/members`.
 */
export function ListMembersSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar los miembros de la empresa (paginado)' }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (default: 1)' }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Tamaño de página (default: 20, máx. 100)',
    }),
    ApiQuery({
      name: 'role',
      required: false,
      enum: MembershipRole,
      description: 'Filtra por rol',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: MembershipStatus,
      description: 'Filtra por estado (ej. INVITED para ver invitaciones pendientes)',
    }),
    ApiOkResponse({
      description: 'Página de miembros de la empresa.',
      schema: {
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/MembershipResponseDto' } },
          page: { type: 'number' },
          limit: { type: 'number' },
          total: { type: 'number' },
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({
      description: 'La empresa no existe o el usuario no es miembro activo de ella.',
    }),
  );
}

/**
 * Decorador Swagger para `PATCH /companies/:id/members/:membershipId`.
 */
export function UpdateMemberSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cambiar el rol y/o el estado de un miembro' }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiParam({ name: 'membershipId', description: 'Id de la membresía' }),
    ApiOkResponse({ description: 'Miembro actualizado.', type: MembershipResponseDto }),
    ApiBadRequestResponse({ description: 'Datos inválidos.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({ description: 'El solicitante no es OWNER/MANAGER de la empresa.' }),
    ApiNotFoundResponse({ description: 'La membresía no existe en esta empresa.' }),
    ApiConflictResponse({ description: 'La empresa debe conservar al menos un OWNER activo.' }),
  );
}

/**
 * Decorador Swagger para `POST /companies/:id/members/:membershipId/accept`.
 */
export function AcceptInvitationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Aceptar la invitación propia a la empresa' }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiParam({ name: 'membershipId', description: 'Id de la membresía (debe ser la propia)' }),
    ApiOkResponse({
      description: 'Invitación aceptada, membresía queda ACTIVE.',
      type: MembershipResponseDto,
    }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({
      description: 'La membresía no existe o no pertenece al usuario autenticado.',
    }),
    ApiConflictResponse({ description: 'La membresía ya no está pendiente de aceptación.' }),
  );
}

/**
 * Decorador Swagger para `POST /companies/:id/members/:membershipId/decline`.
 */
export function DeclineInvitationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Rechazar la invitación propia a la empresa' }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiParam({ name: 'membershipId', description: 'Id de la membresía (debe ser la propia)' }),
    ApiOkResponse({ description: 'Invitación rechazada; la membresía se elimina.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({
      description: 'La membresía no existe o no pertenece al usuario autenticado.',
    }),
    ApiConflictResponse({ description: 'La membresía ya no está pendiente de aceptación.' }),
  );
}

/**
 * Decorador Swagger para `DELETE /companies/:id/members/:membershipId`.
 */
export function RemoveMemberSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un miembro de la empresa',
      description:
        'Un miembro siempre puede eliminarse a sí mismo (salir de la empresa). OWNER/MANAGER puede eliminar a otros miembros o cancelar invitaciones pendientes; un MANAGER no puede eliminar a un OWNER.',
    }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiParam({ name: 'membershipId', description: 'Id de la membresía' }),
    ApiOkResponse({ description: 'Miembro eliminado.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiForbiddenResponse({
      description:
        'El solicitante no tiene permisos para eliminar a este miembro (no es OWNER/MANAGER, o intenta eliminar a un OWNER sin serlo).',
    }),
    ApiNotFoundResponse({ description: 'La membresía no existe en esta empresa.' }),
    ApiConflictResponse({ description: 'La empresa debe conservar al menos un OWNER activo.' }),
  );
}
