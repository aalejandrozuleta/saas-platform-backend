import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { TenantConfig } from '@domain/entities/tenant-config/tenant-config.entity';
import { PlanType } from '@domain/enums/plan-type.enum';
import { TENANT_CONFIG_REPOSITORY } from '@domain/token/repositories.tokens';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import type { TenantConfigRepository } from '@domain/repositories/tenant-config.repository';
import type { AuditLogger } from '@application/ports/audit-logger.port';
import type { SetTenantConfigDto, TenantConfigResponseDto } from '@application/dto/tenant/set-tenant-config.dto';

/** Crea o actualiza la configuración de un tenant (upsert). */
@Injectable()
export class SetTenantConfigUseCase {
  constructor(
    @Inject(TENANT_CONFIG_REPOSITORY)
    private readonly repo: TenantConfigRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(dto: SetTenantConfigDto): Promise<TenantConfigResponseDto> {
    const existing = await this.repo.findByTenantId(dto.tenantId);
    let config: TenantConfig;
    const isNew = !existing;

    if (existing) {
      if (dto.plan !== undefined || dto.maxUsers !== undefined || dto.maxStorage !== undefined) {
        existing.upgrade(
          dto.plan ?? existing.plan,
          dto.maxUsers ?? existing.maxUsers,
          dto.maxStorage ?? existing.maxStorage,
        );
      }
      existing.update({
        name: dto.name,
        logoUrl: dto.logoUrl,
        language: dto.language,
        timezone: dto.timezone,
        customData: dto.customData,
      });
      if (dto.isActive === false) existing.deactivate();
      if (dto.isActive === true) existing.activate();
      config = await this.repo.save(existing);
    } else {
      config = await this.repo.save(
        new TenantConfig({
          id: randomUUID(),
          tenantId: dto.tenantId,
          name: dto.name ?? null,
          logoUrl: dto.logoUrl ?? null,
          language: dto.language ?? 'es',
          timezone: dto.timezone ?? 'UTC',
          plan: dto.plan ?? PlanType.FREE,
          maxUsers: dto.maxUsers ?? 5,
          maxStorage: dto.maxStorage ?? 1024,
          customData: dto.customData ?? null,
          isActive: dto.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }

    await this.auditLogger.log({
      action: isNew ? 'TENANT_CONFIG_CREATED' : 'TENANT_CONFIG_UPDATED',
      resource: 'TenantConfig',
      resourceId: config.tenantId,
      tenantId: dto.tenantId,
    });

    return this.toResponse(config);
  }

  private toResponse(c: TenantConfig): TenantConfigResponseDto {
    return {
      id: c.id,
      tenantId: c.tenantId,
      name: c.name,
      logoUrl: c.logoUrl,
      language: c.language,
      timezone: c.timezone,
      plan: c.plan,
      maxUsers: c.maxUsers,
      maxStorage: c.maxStorage,
      customData: c.customData,
      isActive: c.isActive,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
