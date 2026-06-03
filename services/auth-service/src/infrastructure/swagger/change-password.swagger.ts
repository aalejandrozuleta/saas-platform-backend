import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ChangePasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' }),
    ApiOkResponse({
      description: 'Contraseña actualizada correctamente',
    }),
    ApiUnauthorizedResponse({
      description: 'Contraseña actual incorrecta o usuario no autenticado',
    }),
  );
}
