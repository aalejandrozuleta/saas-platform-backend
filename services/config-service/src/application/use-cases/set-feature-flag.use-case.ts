import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { FeatureFlag } from '@domain/entities/feature-flag/feature-flag.entity';
import { FEATURE_FLAG_REPOSITORY } from '@domain/token/repositories.tokens';
import { AUDIT_LOGGER, CONFIG_CACHE } from '@domain/token/services.tokens';
import type { FeatureFlagRepository } from '@domain/repositories/feature-flag.repository';
import type { ConfigCache } from '@application/ports/config-cache.port';
import type { AuditLogger } from '@application/ports/audit-logger.port';
import type { SetFeatureFlagDto, FeatureFlagResponseDto } from '@application/dto/feature-flag/set-feature-flag.dto';

/**
 * Crea o actualiza un feature flag.
 *
 * @remarks
 * La unicidad se define por `(key, tenantId, role, environment)`.
 * Si ya existe un flag con esa combinación, se actualiza el estado `enabled`.
 * En caso contrario se crea uno nuevo.
 */
@Injectable()
export class SetFeatureFlagUseCase {
  constructor(
    @Inject(FEATURE_FLAG_REPOSITORY)
    private readonly repo: FeatureFlagRepository,
    @Inject(CONFIG_CACHE)
    private readonly cache: ConfigCache,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(dto: SetFeatureFlagDto): Promise<FeatureFlagResponseDto> {
    const existing = await this.repo.findByKey(dto.key, {
      tenantId: dto.tenantId ?? null,
      role: dto.role ?? null,
      environment: dto.environment ?? null,
    });

    let flag: FeatureFlag;
    let action: string;

    if (existing) {
      dto.enabled ? existing.enable() : existing.disable();
      flag = await this.repo.save(existing);
      action = dto.enabled ? 'FEATURE_FLAG_ENABLED' : 'FEATURE_FLAG_DISABLED';
    } else {
      flag = await this.repo.save(
        new FeatureFlag({
          id: randomUUID(),
          key: dto.key,
          enabled: dto.enabled,
          tenantId: dto.tenantId ?? null,
          role: dto.role ?? null,
          environment: dto.environment ?? null,
          description: dto.description ?? null,
          metadata: dto.metadata ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
      action = dto.enabled ? 'FEATURE_FLAG_ENABLED' : 'FEATURE_FLAG_DISABLED';
    }

    await this.cache.del(`flag:${dto.key}:${dto.tenantId ?? '*'}:${dto.role ?? '*'}:${dto.environment ?? '*'}`);

    await this.auditLogger.log({
      action,
      resource: 'FeatureFlag',
      resourceId: flag.id,
      newValue: { key: flag.key, enabled: flag.enabled },
      tenantId: dto.tenantId,
    });

    return this.toResponse(flag);
  }

  private toResponse(flag: FeatureFlag): FeatureFlagResponseDto {
    return {
      id: flag.id,
      key: flag.key,
      enabled: flag.enabled,
      tenantId: flag.tenantId,
      role: flag.role,
      environment: flag.environment,
      description: flag.description,
      metadata: flag.metadata,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
    };
  }
}
