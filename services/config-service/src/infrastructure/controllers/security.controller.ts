import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuccessResponseBuilder } from '@saas/shared';
import { AddIpRuleUseCase } from '@application/use-cases/add-ip-rule.use-case';
import { SetPasswordPolicyUseCase } from '@application/use-cases/set-password-policy.use-case';
import { AddIpRuleDto } from '@application/dto/security/add-ip-rule.dto';
import { SetPasswordPolicyDto } from '@application/dto/security/set-password-policy.dto';
import { IP_RULE_REPOSITORY, PASSWORD_POLICY_REPOSITORY } from '@domain/token/repositories.tokens';
import type { IpRuleRepository } from '@domain/repositories/ip-rule.repository';
import type { PasswordPolicyRepository } from '@domain/repositories/password-policy.repository';
import { IpRuleType } from '@domain/enums/ip-rule-type.enum';
import { Inject } from '@nestjs/common';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import {
  AddIpRuleSwagger,
  GetIpRulesSwagger,
  DeleteIpRuleSwagger,
  SetPasswordPolicySwagger,
  GetPasswordPolicySwagger,
} from '@infrastructure/swagger/security.swagger';

/**
 * Controlador de seguridad: reglas de IP, políticas de contraseñas y dominios permitidos.
 */
@ApiTags('Security')
@Controller('security')
export class SecurityController {
  constructor(
    private readonly addIpRuleUseCase: AddIpRuleUseCase,
    private readonly setPasswordPolicyUseCase: SetPasswordPolicyUseCase,
    @Inject(IP_RULE_REPOSITORY)
    private readonly ipRuleRepo: IpRuleRepository,
    @Inject(PASSWORD_POLICY_REPOSITORY)
    private readonly passwordPolicyRepo: PasswordPolicyRepository,
  ) {}

  // ─── IP Rules ───────────────────────────────────────────────────────────────

  @Post('ip-rules')
  @AddIpRuleSwagger()
  async addIpRule(@Body() dto: AddIpRuleDto) {
    const data = await this.addIpRuleUseCase.execute(dto);
    return SuccessResponseBuilder.build(data);
  }

  @Get('ip-rules')
  @GetIpRulesSwagger()
  async listIpRules(
    @Query('type') type?: IpRuleType,
    @Query('tenantId') tenantId?: string,
  ) {
    const rules = await this.ipRuleRepo.findAll(type, tenantId);
    const data = rules.map((r) => ({
      id: r.id,
      ip: r.ip,
      cidr: r.cidr,
      type: r.type,
      tenantId: r.tenantId,
      reason: r.reason,
      expiresAt: r.expiresAt,
      isActive: r.isActive(),
      createdAt: r.createdAt,
    }));
    return SuccessResponseBuilder.build(data);
  }

  @Delete('ip-rules/:id')
  @HttpCode(HttpStatus.OK)
  @DeleteIpRuleSwagger()
  async deleteIpRule(@Param('id') id: string) {
    const rule = await this.ipRuleRepo.findById(id);
    if (!rule) throw DomainErrorFactory.ipRuleNotFound(id);
    await this.ipRuleRepo.delete(id);
    return SuccessResponseBuilder.build({ deleted: true, id });
  }

  // ─── Password Policy ────────────────────────────────────────────────────────

  @Post('password-policy')
  @HttpCode(HttpStatus.OK)
  @SetPasswordPolicySwagger()
  async setPasswordPolicy(@Body() dto: SetPasswordPolicyDto) {
    const data = await this.setPasswordPolicyUseCase.execute(dto);
    return SuccessResponseBuilder.build(data);
  }

  @Get('password-policy')
  @GetPasswordPolicySwagger()
  async getPasswordPolicy(@Query('tenantId') tenantId?: string) {
    const policy = await this.passwordPolicyRepo.findByTenantId(tenantId ?? null);
    if (!policy) {
      return SuccessResponseBuilder.build(null);
    }
    return SuccessResponseBuilder.build(policy.toSnapshot());
  }
}
