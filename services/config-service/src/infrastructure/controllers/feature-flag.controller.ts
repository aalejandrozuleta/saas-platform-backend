import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { successResponse } from '@saas/shared';
import { SetFeatureFlagUseCase } from '@application/use-cases/set-feature-flag.use-case';
import { SetFeatureFlagDto } from '@application/dto/feature-flag/set-feature-flag.dto';
import { FEATURE_FLAG_REPOSITORY } from '@domain/token/repositories.tokens';
import type { FeatureFlagRepository } from '@domain/repositories/feature-flag.repository';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';
import {
  SetFeatureFlagSwagger,
  GetFeatureFlagsSwagger,
  DeleteFeatureFlagSwagger,
} from '@infrastructure/swagger/feature-flag.swagger';

/**
 * Controlador de feature flags de plataforma.
 *
 * Permite a super-admins activar/desactivar servicios y módulos
 * sin necesidad de redesplegar.
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
    return successResponse(data);
  }

  @Get()
  @GetFeatureFlagsSwagger()
  async listFlags(
    @Query('enabled') enabled?: string,
    @Query('environment') environment?: string,
  ) {
    const flags = await this.repo.findAll({
      enabled: enabled ? enabled === 'true' : undefined,
      environment: environment ?? undefined,
    });
    return successResponse(flags.map((f) => f.toSnapshot()));
  }

  @Delete(':id')
  @DeleteFeatureFlagSwagger()
  async deleteFlag(@Param('id') id: string) {
    const flags = await this.repo.findAll();
    const flag = flags.find((f) => f.id === id);
    if (!flag) throw DomainErrorFactory.featureFlagNotFound(id);
    await this.repo.delete(id);
    return successResponse({ deleted: true, id });
  }
}
