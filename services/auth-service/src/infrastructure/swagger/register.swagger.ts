import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { RegisterUserResponseDto } from '@application/dto/register/register-user-response.dto';

export function RegisterSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Registrar usuario' }),
    ApiCreatedResponse({
      description: 'Usuario registrado correctamente',
      type: RegisterUserResponseDto,
    }),
  );
}