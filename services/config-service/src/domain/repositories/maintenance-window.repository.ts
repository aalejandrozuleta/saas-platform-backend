import { MaintenanceWindow } from '@domain/entities/maintenance-window/maintenance-window.entity';

export interface MaintenanceWindowRepository {
  findById(id: string): Promise<MaintenanceWindow | null>;
  findActive(tenantId?: string | null): Promise<MaintenanceWindow[]>;
  findAll(tenantId?: string | null): Promise<MaintenanceWindow[]>;
  findOverlapping(startAt: Date, endAt: Date, tenantId?: string | null): Promise<MaintenanceWindow[]>;
  save(window: MaintenanceWindow): Promise<MaintenanceWindow>;
  delete(id: string): Promise<void>;
}
