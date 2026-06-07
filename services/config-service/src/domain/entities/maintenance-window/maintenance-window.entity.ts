export interface MaintenanceWindowProps {
  id: string;
  title: string;
  description?: string | null;
  startAt: Date;
  endAt: Date;
  tenantId?: string | null;
  isActive: boolean;
  notifiedAt?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ventana de mantenimiento programada.
 *
 * @remarks
 * Permite programar períodos de inactividad con notificación anticipada.
 * Una ventana está "activa" cuando `isActive=true` y la hora actual
 * está entre `startAt` y `endAt`.
 */
export class MaintenanceWindow {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly startAt: Date;
  readonly endAt: Date;
  readonly tenantId: string | null;
  private _isActive: boolean;
  private _notifiedAt: Date | null;
  readonly createdBy: string | null;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: MaintenanceWindowProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description ?? null;
    this.startAt = props.startAt;
    this.endAt = props.endAt;
    this.tenantId = props.tenantId ?? null;
    this._isActive = props.isActive;
    this._notifiedAt = props.notifiedAt ?? null;
    this.createdBy = props.createdBy ?? null;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get isActive(): boolean { return this._isActive; }
  get notifiedAt(): Date | null { return this._notifiedAt; }
  get updatedAt(): Date { return this._updatedAt; }

  /** Devuelve `true` si la ventana está activa y en curso ahora. */
  isOngoing(now: Date = new Date()): boolean {
    return this._isActive && now >= this.startAt && now <= this.endAt;
  }

  /** Devuelve `true` si la ventana está activa y aún no ha comenzado. */
  isPending(now: Date = new Date()): boolean {
    return this._isActive && now < this.startAt;
  }

  cancel(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  markNotified(): void {
    this._notifiedAt = new Date();
    this._updatedAt = new Date();
  }

  toSnapshot(): MaintenanceWindowProps {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      startAt: this.startAt,
      endAt: this.endAt,
      tenantId: this.tenantId,
      isActive: this._isActive,
      notifiedAt: this._notifiedAt,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
