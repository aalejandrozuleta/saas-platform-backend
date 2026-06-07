import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { RateLimit } from '@domain/entities/rate-limit/rate-limit.entity';
import { RATE_LIMIT_REPOSITORY } from '@domain/token/repositories.tokens';
import { AUDIT_LOGGER, CONFIG_CACHE } from '@domain/token/services.tokens';
import type { RateLimitRepository } from '@domain/repositories/rate-limit.repository';
import type { ConfigCache } from '@application/ports/config-cache.port';
import type { AuditLogger } from '@application/ports/audit-logger.port';
import type { SetRateLimitDto, RateLimitResponseDto } from '@application/dto/rate-limit/set-rate-limit.dto';

/** Crea o actualiza un rate limit dinámico por endpoint y tenant (upsert). */
@Injectable()
export class SetRateLimitUseCase {
  constructor(
    @Inject(RATE_LIMIT_REPOSITORY)
    private readonly repo: RateLimitRepository,
    @Inject(CONFIG_CACHE)
    private readonly cache: ConfigCache,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(dto: SetRateLimitDto): Promise<RateLimitResponseDto> {
    const tenantId = dto.tenantId ?? null;
    const existing = await this.repo.findByEndpointAndTenant(dto.endpoint, tenantId);
    let rl: RateLimit;

    if (existing) {
      existing.update(dto.maxRequests, dto.windowSeconds);
      rl = await this.repo.save(existing);
    } else {
      rl = await this.repo.save(
        new RateLimit({
          id: randomUUID(),
          endpoint: dto.endpoint,
          maxRequests: dto.maxRequests,
          windowSeconds: dto.windowSeconds,
          tenantId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }

    await this.cache.del(`ratelimit:${dto.endpoint}:${tenantId ?? 'global'}`);

    await this.auditLogger.log({
      action: existing ? 'RATE_LIMIT_UPDATED' : 'RATE_LIMIT_CREATED',
      resource: 'RateLimitConfig',
      resourceId: rl.id,
      newValue: { endpoint: dto.endpoint, maxRequests: dto.maxRequests, windowSeconds: dto.windowSeconds },
      tenantId,
    });

    return {
      id: rl.id,
      endpoint: rl.endpoint,
      maxRequests: rl.maxRequests,
      windowSeconds: rl.windowSeconds,
      tenantId: rl.tenantId,
      isActive: rl.isActive,
      updatedAt: rl.updatedAt,
    };
  }
}
