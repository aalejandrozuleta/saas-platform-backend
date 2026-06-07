import { ApiProperty } from '@nestjs/swagger';

export class SystemStatsDto {
  @ApiProperty() totalConfigs!: number;
  @ApiProperty() totalFeatureFlags!: number;
  @ApiProperty() enabledFeatureFlags!: number;
  @ApiProperty() totalTenants!: number;
  @ApiProperty() activeTenants!: number;
  @ApiProperty() totalIpRules!: number;
  @ApiProperty() activeMaintenanceWindows!: number;
  @ApiProperty() totalRateLimits!: number;
  @ApiProperty() generatedAt!: Date;
}
