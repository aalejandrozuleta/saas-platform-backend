import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SuccessResponseBuilder } from '@saas/shared';
import { SetFeatureFlagUseCase } from '@application/use-cases/set-feature-flag.use-case';
import { SetFeatureFlagDto } from '@application/dto/feature-flag/set-feature-flag.dto';
import { FEATURE_FLAG_REPOSITORY } from '@domain/token/repositories.tokens';
import type { FeatureFlagRepository } from '@domain/repositories/feature-flag.repository';
import { Inject } from '@nestjs/common';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import {
  SetFeatureFlagSwagger,
  GetFeatureFlagsSwagger,
  DeleteFeatureFlagSwagger,
} from '@infrastructure/swagger/feature-flag.swagger';

/**
 * Controlador de feature flags.
 *
 * @remarks
 * Permite gestionar activación de funcionalidades por tenant, rol y entorno.
 */
@ApiTags('Feature Flags')
@Controller('feature-flags')
export class FeatureFlagController {
  constructor(
    private readonly setFlagUseCase: SetFeatureFlagUseCase,
    @Inject(FEATURE_FLAG_REPOSITORY)
    private readonly repo: FeatureFlagRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @SetFeatureFlagSwagger()
  async setFlag(@Body() dto: SetFeatureFlagDto) {
    const data = await this.setFlagUseCase.execute(dto);
    return SuccessResponseBuilder.build(data);
  }

  @Get()
  @GetFeatureFlagsSwagger()
  async listFlags(
    @Query('tenantId') tenantId?: string,
    @Query('enabled') enabled?: string,
  ) {
    const flags = await this.repo.findAll({
      tenantId: tenantId ?? undefined,
      enabled: enabled !== undefined ? enabled === 'true' : undefined,
    });
    const data = flags.map((f) => f.toSnapshot());
    return SuccessResponseBuilder.build(data);
  }

  @Delete(':id')
  @DeleteFeatureFlagSwagger()
  async deleteFlag(@Param('id') id: string) {
    const flags = await this.repo.findAll();
    const flag = flags.find((f) => f.id === id);
    if (!flag) throw DomainErrorFactory.featureFlagNotFound(id);
    await this.repo.delete(id);
    return SuccessResponseBuilder.build({ deleted: true, id });
  }
}
