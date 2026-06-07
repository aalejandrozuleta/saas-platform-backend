import { Inject, Injectable } from '@nestjs/common';
import { STATS_SERVICE } from '@domain/token/services.tokens';
import type { StatsPort, SystemStats } from '@application/ports/stats.port';

/**
 * Obtiene estadísticas agregadas del sistema de configuración.
 *
 * @remarks
 * Las estadísticas se calculan mediante consultas agregadas directas
 * a la base de datos a través del puerto `StatsPort`.
 */
@Injectable()
export class GetSystemStatsUseCase {
  constructor(
    @Inject(STATS_SERVICE)
    private readonly statsService: StatsPort,
  ) {}

  async execute(): Promise<SystemStats> {
    return this.statsService.getSystemStats();
  }
}
