import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { PasswordPolicy } from '@domain/entities/password-policy/password-policy.entity';
import { PASSWORD_POLICY_REPOSITORY } from '@domain/token/repositories.tokens';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import type { PasswordPolicyRepository } from '@domain/repositories/password-policy.repository';
import type { AuditLogger } from '@application/ports/audit-logger.port';
import type { SetPasswordPolicyDto, PasswordPolicyResponseDto } from '@application/dto/security/set-password-policy.dto';

/**
 * Crea o actualiza la política de contraseñas para un tenant o globalmente.
 *
 * @remarks
 * Cuando `tenantId` no se proporciona, se actualiza la política global.
 * Los campos no enviados conservan su valor actual.
 */
@Injectable()
export class SetPasswordPolicyUseCase {
  constructor(
    @Inject(PASSWORD_POLICY_REPOSITORY)
    private readonly repo: PasswordPolicyRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(dto: SetPasswordPolicyDto): Promise<PasswordPolicyResponseDto> {
    const tenantId = dto.tenantId ?? null;
    const existing = await this.repo.findByTenantId(tenantId);
    let policy: PasswordPolicy;

    if (existing) {
      existing.update({
        minLength: dto.minLength,
        requireUppercase: dto.requireUppercase,
        requireLowercase: dto.requireLowercase,
        requireNumbers: dto.requireNumbers,
        requireSymbols: dto.requireSymbols,
        maxAgeDays: dto.maxAgeDays,
        historyCount: dto.historyCount,
        maxConcurrentSessions: dto.maxConcurrentSessions,
      });
      policy = await this.repo.save(existing);
    } else {
      policy = await this.repo.save(
        new PasswordPolicy({
          id: randomUUID(),
          tenantId,
          minLength: dto.minLength ?? 8,
          requireUppercase: dto.requireUppercase ?? true,
          requireLowercase: dto.requireLowercase ?? true,
          requireNumbers: dto.requireNumbers ?? true,
          requireSymbols: dto.requireSymbols ?? false,
          maxAgeDays: dto.maxAgeDays ?? null,
          historyCount: dto.historyCount ?? 5,
          maxConcurrentSessions: dto.maxConcurrentSessions ?? 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }

    await this.auditLogger.log({
      action: existing ? 'PASSWORD_POLICY_UPDATED' : 'PASSWORD_POLICY_CREATED',
      resource: 'PasswordPolicy',
      resourceId: policy.id,
      tenantId,
    });

    return this.toResponse(policy);
  }

  private toResponse(p: PasswordPolicy): PasswordPolicyResponseDto {
    return {
      id: p.id,
      tenantId: p.tenantId,
      minLength: p.minLength,
      requireUppercase: p.requireUppercase,
      requireLowercase: p.requireLowercase,
      requireNumbers: p.requireNumbers,
      requireSymbols: p.requireSymbols,
      maxAgeDays: p.maxAgeDays,
      historyCount: p.historyCount,
      maxConcurrentSessions: p.maxConcurrentSessions,
      updatedAt: p.updatedAt,
    };
  }
}
