import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuccessResponseBuilder } from '@saas/shared';
import { SetRateLimitUseCase } from '@application/use-cases/set-rate-limit.use-case';
import { SetRateLimitDto } from '@application/dto/rate-limit/set-rate-limit.dto';
import { RATE_LIMIT_REPOSITORY } from '@domain/token/repositories.tokens';
import type { RateLimitRepository } from '@domain/repositories/rate-limit.repository';
import { Inject } from '@nestjs/common';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import { SetRateLimitSwagger, GetRateLimitsSwagger, DeleteRateLimitSwagger } from '@infrastructure/swagger/rate-limit.swagger';

/**
 * Controlador de rate limits dinámicos por endpoint y tenant.
 */
@ApiTags('Rate Limits')
@Controller('rate-limits')
export class RateLimitController {
  constructor(
    private readonly setRateLimitUseCase: SetRateLimitUseCase,
    @Inject(RATE_LIMIT_REPOSITORY)
    private readonly repo: RateLimitRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @SetRateLimitSwagger()
  async upsert(@Body() dto: SetRateLimitDto) {
    const data = await this.setRateLimitUseCase.execute(dto);
    return SuccessResponseBuilder.build(data);
  }

  @Get()
  @GetRateLimitsSwagger()
  async list(@Query('tenantId') tenantId?: string) {
    const limits = await this.repo.findAll(tenantId);
    const data = limits.map((rl) => rl.toSnapshot());
    return SuccessResponseBuilder.build(data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @DeleteRateLimitSwagger()
  async delete(@Param('id') id: string) {
    const rl = await this.repo.findById(id);
    if (!rl) throw DomainErrorFactory.rateLimitNotFound(id);
    await this.repo.delete(id);
    return SuccessResponseBuilder.build({ deleted: true, id });
  }
}
