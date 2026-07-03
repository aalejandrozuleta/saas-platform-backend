import { ApiProperty } from '@nestjs/swagger';

/**
 * Estadísticas agregadas del sistema de configuración, calculadas en el
 * momento de la petición (no cacheadas). Ver `GetSystemStatsUseCase`.
 */
export class SystemStatsDto {
  @ApiProperty() totalFeatureFlags!: number;
  @ApiProperty() enabledFeatureFlags!: number;
  @ApiProperty() disabledFeatureFlags!: number;
  @ApiProperty() activeMaintenanceWindows!: number;
  @ApiProperty() upcomingMaintenanceWindows!: number;
  @ApiProperty() maintenanceEnabled!: boolean;
  @ApiProperty() readOnlyEnabled!: boolean;
  @ApiProperty() generatedAt!: Date;
}
