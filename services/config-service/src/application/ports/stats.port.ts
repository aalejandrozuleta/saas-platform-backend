export interface SystemStats {
  totalFeatureFlags: number;
  enabledFeatureFlags: number;
  disabledFeatureFlags: number;
  activeMaintenanceWindows: number;
  upcomingMaintenanceWindows: number;
  maintenanceEnabled: boolean;
  readOnlyEnabled: boolean;
  generatedAt: Date;
}

export interface StatsPort {
  getSystemStats(): Promise<SystemStats>;
}
