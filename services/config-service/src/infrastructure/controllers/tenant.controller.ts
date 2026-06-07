import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuccessResponseBuilder } from '@saas/shared';
import { SetTenantConfigUseCase } from '@application/use-cases/set-tenant-config.use-case';
import { SetTenantConfigDto } from '@application/dto/tenant/set-tenant-config.dto';
import { TENANT_CONFIG_REPOSITORY } from '@domain/token/repositories.tokens';
import type { TenantConfigRepository } from '@domain/repositories/tenant-config.repository';
import { Inject } from '@nestjs/common';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { SetTenantConfigSwagger, GetTenantConfigSwagger, GetAllTenantsSwagger } from '@infrastructure/swagger/tenant.swagger';

/**
 * Controlador de configuración por tenant.
 *
 * @remarks
 * Gestiona los planes, límites, idioma, zona horaria y datos personalizados de cada tenant.
 */
@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly setTenantConfig: SetTenantConfigUseCase,
    @Inject(TENANT_CONFIG_REPOSITORY)
    private readonly repo: TenantConfigRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @SetTenantConfigSwagger()
  async upsert(@Body() dto: SetTenantConfigDto) {
    const data = await this.setTenantConfig.execute(dto);
    return SuccessResponseBuilder.build(data);
  }

  @Get()
  @GetAllTenantsSwagger()
  async listAll() {
    const configs = await this.repo.findAll();
    return SuccessResponseBuilder.build(configs.map((c) => c.toSnapshot()));
  }

  @Get(':tenantId')
  @GetTenantConfigSwagger()
  async getOne(@Param('tenantId') tenantId: string) {
    const config = await this.repo.findByTenantId(tenantId);
    if (!config) throw DomainErrorFactory.tenantConfigNotFound(tenantId);
    return SuccessResponseBuilder.build(config.toSnapshot());
  }
}
