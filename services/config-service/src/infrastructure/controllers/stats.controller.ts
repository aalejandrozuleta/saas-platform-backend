import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseBuilder } from '@saas/shared';
import { GetSystemStatsUseCase } from '@application/use-cases/get-system-stats.use-case';
import { SystemStatsDto } from '@application/dto/stats/system-stats.dto';

/**
 * Controlador de estadísticas del sistema de configuración.
 */
@ApiTags('Stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly getStatsUseCase: GetSystemStatsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Estadísticas agregadas del sistema de configuración' })
  @ApiOkResponse({ type: SystemStatsDto })
  async getStats() {
    const data = await this.getStatsUseCase.execute();
    return SuccessResponseBuilder.build(data);
  }
}
