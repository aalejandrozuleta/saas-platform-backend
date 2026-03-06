import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { LoginUserResponseDto } from '@application/dto/login/login-user-response.dto';

export function LoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Autenticar usuario' }),
    ApiOkResponse({
      description: 'Login exitoso',
      type: LoginUserResponseDto,
    }),
  );
}