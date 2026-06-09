import type { MaintenanceWindow } from '@domain/entities/maintenance-window/maintenance-window.entity';

export interface MaintenanceWindowRepository {
  findById(id: string): Promise<MaintenanceWindow | null>;
  findActive(): Promise<MaintenanceWindow[]>;
  findAll(): Promise<MaintenanceWindow[]>;
  findOverlapping(startAt: Date, endAt: Date): Promise<MaintenanceWindow[]>;
  save(window: MaintenanceWindow): Promise<MaintenanceWindow>;
  delete(id: string): Promise<void>;
}
