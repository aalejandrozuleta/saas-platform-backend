import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UserProfileResponseDto } from '@application/dto/user-profile/user-profile-response.dto';

/**
 * Decorador Swagger para `POST /users/me/profile` ("paso 2" del registro).
 */
export function CreateUserProfileSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear el perfil del usuario autenticado' }),
    ApiCreatedResponse({ description: 'Perfil creado.', type: UserProfileResponseDto }),
    ApiBadRequestResponse({
      description: 'Datos inválidos o no se aceptaron los consentimientos.',
    }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiConflictResponse({ description: 'El usuario ya tiene un perfil creado.' }),
  );
}

/**
 * Decorador Swagger para `GET /users/me/profile`.
 */
export function GetUserProfileSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' }),
    ApiOkResponse({ description: 'Perfil del usuario.', type: UserProfileResponseDto }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({ description: 'El usuario todavía no ha creado su perfil.' }),
  );
}

/**
 * Decorador Swagger para `PATCH /users/me/profile`.
 */
export function UpdateUserProfileSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualizar (parcialmente) el perfil del usuario autenticado' }),
    ApiOkResponse({ description: 'Perfil actualizado.', type: UserProfileResponseDto }),
    ApiBadRequestResponse({ description: 'Datos inválidos.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({ description: 'El usuario todavía no ha creado su perfil.' }),
  );
}

/**
 * Decorador Swagger para `POST /users/me/profile/avatar`.
 */
export function UploadProfileImageSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Subir/reemplazar la foto de perfil' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: { file: { type: 'string', format: 'binary' } },
      },
    }),
    ApiOkResponse({ description: 'Foto de perfil actualizada.', type: UserProfileResponseDto }),
    ApiBadRequestResponse({ description: 'Formato de imagen no soportado.' }),
    ApiUnauthorizedResponse({ description: 'No autenticado.' }),
    ApiNotFoundResponse({ description: 'El usuario todavía no ha creado su perfil.' }),
  );
}
