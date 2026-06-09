import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { FeatureFlag } from '@domain/entities/feature-flag/feature-flag.entity';
import { FEATURE_FLAG_REPOSITORY } from '@domain/token/repositories.tokens';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import type { FeatureFlagRepository } from '@domain/repositories/feature-flag.repository';
import type { AuditLogger } from '@application/ports/audit-logger.port';
import type { SetFeatureFlagDto, FeatureFlagResponseDto } from '@application/dto/feature-flag/set-feature-flag.dto';

/**
 * Crea o actualiza un feature flag de plataforma.
 *
 * La clave única es (key, environment). Permite a super-admins
 * apagar/encender servicios o módulos específicos sin redesplegar.
 */
@Injectable()
export class SetFeatureFlagUseCase {
  constructor(
    @Inject(FEATURE_FLAG_REPOSITORY)
    private readonly repo: FeatureFlagRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(dto: SetFeatureFlagDto): Promise<FeatureFlagResponseDto> {
    const environment = dto.environment ?? null;
    const existing = await this.repo.findByKey(dto.key, environment);

    let flag: FeatureFlag;

    if (existing) {
      dto.enabled ? existing.enable() : existing.disable();
      flag = await this.repo.save(existing);
    } else {
      flag = await this.repo.save(
        new FeatureFlag({
          id: randomUUID(),
          key: dto.key,
          enabled: dto.enabled,
          environment,
          description: dto.description ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }

    await this.auditLogger.log({
      action: dto.enabled ? 'FEATURE_FLAG_ENABLED' : 'FEATURE_FLAG_DISABLED',
      resource: 'FeatureFlag',
      resourceId: flag.id,
      newValue: { key: flag.key, enabled: flag.enabled, environment: flag.environment },
      performedBy: dto.updatedBy,
    });

    return this.toResponse(flag);
  }

  private toResponse(flag: FeatureFlag): FeatureFlagResponseDto {
    return {
      id: flag.id,
      key: flag.key,
      enabled: flag.enabled,
      environment: flag.environment,
      description: flag.description,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
    };
  }
}
