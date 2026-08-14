import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiServiceUnavailableResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

/**
 * Decoradores Swagger para los endpoints de perfil de usuario del API
 * Gateway. El perfil vive físicamente en auth-service (reenviado vía
 * `AuthProxy`), pero se expone en el gateway como un contrato público
 * separado del de autenticación (`UserController`, no `AuthController`).
 */

/** Swagger para `POST /v1/users/me/profile` */
export function CreateUserProfileGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear el perfil del usuario autenticado' }),
    ApiCreatedResponse({ description: 'Perfil creado.' }),
    ApiBadRequestResponse({ description: 'Datos inválidos o consentimientos no aceptados.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiConflictResponse({ description: 'El usuario ya tiene un perfil creado.' }),
    ApiServiceUnavailableResponse({ description: 'Auth-service no disponible.' }),
  );
}

/** Swagger para `GET /v1/users/me/profile` */
export function GetUserProfileGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' }),
    ApiOkResponse({ description: 'Perfil del usuario.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({ description: 'El usuario todavía no ha creado su perfil.' }),
    ApiServiceUnavailableResponse({ description: 'Auth-service no disponible.' }),
  );
}

/** Swagger para `PATCH /v1/users/me/profile` */
export function UpdateUserProfileGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar (parcialmente) el perfil del usuario autenticado' }),
    ApiOkResponse({ description: 'Perfil actualizado.' }),
    ApiBadRequestResponse({ description: 'Datos inválidos.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({ description: 'El usuario todavía no ha creado su perfil.' }),
    ApiServiceUnavailableResponse({ description: 'Auth-service no disponible.' }),
  );
}

/** Swagger para `POST /v1/users/me/profile/avatar` */
export function UploadProfileImageGatewaySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Subir/reemplazar la foto de perfil' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: { file: { type: 'string', format: 'binary' } },
      },
    }),
    ApiOkResponse({ description: 'Foto de perfil actualizada.' }),
    ApiBadRequestResponse({ description: 'Formato de imagen no soportado.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({ description: 'El usuario todavía no ha creado su perfil.' }),
    ApiServiceUnavailableResponse({ description: 'Auth-service no disponible.' }),
  );
}
