export interface SystemStats {
  totalConfigs: number;
  totalFeatureFlags: number;
  enabledFeatureFlags: number;
  totalTenants: number;
  activeTenants: number;
  totalIpRules: number;
  activeMaintenanceWindows: number;
  totalRateLimits: number;
  generatedAt: Date;
}

/** Puerto para obtener estadísticas agregadas del sistema. */
export interface StatsPort {
  getSystemStats(): Promise<SystemStats>;
}
