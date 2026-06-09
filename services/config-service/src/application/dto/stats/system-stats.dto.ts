import { ApiProperty } from '@nestjs/swagger';

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
