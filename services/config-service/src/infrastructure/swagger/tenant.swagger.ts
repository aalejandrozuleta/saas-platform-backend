import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { TenantConfigResponseDto } from '@application/dto/tenant/set-tenant-config.dto';

export function SetTenantConfigSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Crear o actualizar la configuración de un tenant' }),
    ApiOkResponse({ type: TenantConfigResponseDto }),
    ApiBadRequestResponse({ description: 'Datos de entrada inválidos' }),
  );
}

export function GetTenantConfigSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Obtener configuración de un tenant específico' }),
    ApiOkResponse({ type: TenantConfigResponseDto }),
  );
}

export function GetAllTenantsSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Listar configuraciones de todos los tenants' }),
    ApiOkResponse({ type: [TenantConfigResponseDto] }),
  );
}
