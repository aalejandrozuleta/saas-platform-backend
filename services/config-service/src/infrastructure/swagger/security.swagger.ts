import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation, ApiOkResponse, ApiCreatedResponse,
  ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse,
} from '@nestjs/swagger';
import { IpRuleResponseDto } from '@application/dto/security/add-ip-rule.dto';
import { PasswordPolicyResponseDto } from '@application/dto/security/set-password-policy.dto';

export function AddIpRuleSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Añadir IP a whitelist o blacklist' }),
    ApiCreatedResponse({ type: IpRuleResponseDto }),
    ApiBadRequestResponse({ description: 'IP inválida' }),
    ApiConflictResponse({ description: 'La IP ya tiene una regla activa' }),
  );
}

export function GetIpRulesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar reglas de IP con filtros opcionales' }),
    ApiOkResponse({ type: [IpRuleResponseDto] }),
  );
}

export function DeleteIpRuleSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Eliminar una regla de IP por ID' }),
    ApiOkResponse({ description: 'Regla eliminada' }),
    ApiNotFoundResponse({ description: 'Regla no encontrada' }),
  );
}

export function SetPasswordPolicySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear o actualizar política de contraseñas' }),
    ApiOkResponse({ type: PasswordPolicyResponseDto }),
    ApiBadRequestResponse({ description: 'Datos inválidos' }),
  );
}

export function GetPasswordPolicySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener política de contraseñas vigente' }),
    ApiOkResponse({ type: PasswordPolicyResponseDto }),
  );
}
