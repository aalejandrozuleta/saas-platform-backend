import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { IpRule } from '@domain/entities/ip-rule/ip-rule.entity';
import { IP_RULE_REPOSITORY } from '@domain/token/repositories.tokens';
import { AUDIT_LOGGER } from '@domain/token/services.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import type { IpRuleRepository } from '@domain/repositories/ip-rule.repository';
import type { AuditLogger } from '@application/ports/audit-logger.port';
import type { AddIpRuleDto, IpRuleResponseDto } from '@application/dto/security/add-ip-rule.dto';

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$|^([0-9a-fA-F:]+)(\/\d{1,3})?$/;

/**
 * Añade una regla de whitelist o blacklist para una IP o rango CIDR.
 *
 * @remarks
 * Valida el formato de la IP antes de persistir.
 * Lanza `CONFLICT` si ya existe una regla activa para la misma IP y tenant.
 */
@Injectable()
export class AddIpRuleUseCase {
  constructor(
    @Inject(IP_RULE_REPOSITORY)
    private readonly repo: IpRuleRepository,
    @Inject(AUDIT_LOGGER)
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(dto: AddIpRuleDto): Promise<IpRuleResponseDto> {
    if (!IP_REGEX.test(dto.ip)) {
      throw DomainErrorFactory.invalidIpAddress(dto.ip);
    }

    const existing = await this.repo.findByIpAndTenant(dto.ip, dto.tenantId ?? null);
    if (existing && existing.isActive()) {
      throw DomainErrorFactory.ipRuleAlreadyExists(dto.ip);
    }

    const rule = new IpRule({
      id: randomUUID(),
      ip: dto.ip,
      cidr: dto.cidr ?? null,
      type: dto.type,
      tenantId: dto.tenantId ?? null,
      reason: dto.reason ?? null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      createdBy: dto.createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.repo.save(rule);

    await this.auditLogger.log({
      action: `IP_RULE_${dto.type}_ADDED`,
      resource: 'IpRule',
      resourceId: saved.id,
      newValue: { ip: dto.ip, type: dto.type },
      performedBy: dto.createdBy,
      tenantId: dto.tenantId,
    });

    return {
      id: saved.id,
      ip: saved.ip,
      cidr: saved.cidr,
      type: saved.type,
      tenantId: saved.tenantId,
      reason: saved.reason,
      expiresAt: saved.expiresAt,
      isActive: saved.isActive(),
      createdAt: saved.createdAt,
    };
  }
}
