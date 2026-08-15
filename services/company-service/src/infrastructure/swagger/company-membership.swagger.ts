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
} from '@nestjs/swagger';
import { MembershipResponseDto } from '@application/dto/company-membership/membership-response.dto';

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
    ApiOperation({ summary: 'Listar los miembros de la empresa' }),
    ApiParam({ name: 'id', description: 'Id de la empresa' }),
    ApiOkResponse({ description: 'Miembros de la empresa.', type: [MembershipResponseDto] }),
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
