import type { MaintenanceWindow } from '@domain/entities/maintenance-window/maintenance-window.entity';

/**
 * Contrato de persistencia para ventanas de mantenimiento.
 * La capa de aplicación depende de esta interfaz, no de la implementación
 * concreta (Prisma), siguiendo el patrón de puertos y adaptadores.
 */
export interface MaintenanceWindowRepository {
  /** Busca una ventana por su ID. */
  findById(id: string): Promise<MaintenanceWindow | null>;
  /** Lista las ventanas actualmente activas (aún no finalizadas). */
  findActive(): Promise<MaintenanceWindow[]>;
  /** Lista todas las ventanas registradas, pasadas y futuras. */
  findAll(): Promise<MaintenanceWindow[]>;
  /**
   * Busca ventanas activas cuyo rango se solape con el rango dado.
   * Se usa para validar que no se programen dos ventanas simultáneas.
   */
  findOverlapping(startAt: Date, endAt: Date): Promise<MaintenanceWindow[]>;
  /** Crea o actualiza (upsert) una ventana de mantenimiento. */
  save(window: MaintenanceWindow): Promise<MaintenanceWindow>;
  /** Elimina una ventana por su ID. */
  delete(id: string): Promise<void>;
}
