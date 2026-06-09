export interface MaintenanceWindowProps {
  id: string;
  title: string;
  description?: string | null;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
  notifiedAt?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ventana de mantenimiento programada de la plataforma.
 */
export class MaintenanceWindow {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly startAt: Date;
  readonly endAt: Date;
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
    this._isActive = props.isActive;
    this._notifiedAt = props.notifiedAt ?? null;
    this.createdBy = props.createdBy ?? null;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get isActive(): boolean { return this._isActive; }
  get notifiedAt(): Date | null { return this._notifiedAt; }
  get updatedAt(): Date { return this._updatedAt; }

  isOngoing(now: Date = new Date()): boolean {
    return this._isActive && now >= this.startAt && now <= this.endAt;
  }

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
      isActive: this._isActive,
      notifiedAt: this._notifiedAt,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
