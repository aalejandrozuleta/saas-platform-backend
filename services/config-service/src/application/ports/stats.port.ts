/** Fotografía agregada del estado del sistema en el momento de la consulta. */
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

/** Puerto para obtener estadísticas agregadas del sistema de configuración. */
export interface StatsPort {
  getSystemStats(): Promise<SystemStats>;
}
