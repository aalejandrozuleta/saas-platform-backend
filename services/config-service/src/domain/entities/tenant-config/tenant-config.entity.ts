import { PlanType } from '@domain/enums/plan-type.enum';

export interface TenantConfigProps {
  id: string;
  tenantId: string;
  name?: string | null;
  logoUrl?: string | null;
  language: string;
  timezone: string;
  plan: PlanType;
  maxUsers: number;
  maxStorage: number;
  customData?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Configuración específica de un tenant dentro de la plataforma SaaS. */
export class TenantConfig {
  readonly id: string;
  readonly tenantId: string;
  private _name: string | null;
  private _logoUrl: string | null;
  private _language: string;
  private _timezone: string;
  private _plan: PlanType;
  private _maxUsers: number;
  private _maxStorage: number;
  private _customData: Record<string, unknown> | null;
  private _isActive: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: TenantConfigProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this._name = props.name ?? null;
    this._logoUrl = props.logoUrl ?? null;
    this._language = props.language;
    this._timezone = props.timezone;
    this._plan = props.plan;
    this._maxUsers = props.maxUsers;
    this._maxStorage = props.maxStorage;
    this._customData = props.customData ?? null;
    this._isActive = props.isActive;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get name(): string | null { return this._name; }
  get logoUrl(): string | null { return this._logoUrl; }
  get language(): string { return this._language; }
  get timezone(): string { return this._timezone; }
  get plan(): PlanType { return this._plan; }
  get maxUsers(): number { return this._maxUsers; }
  get maxStorage(): number { return this._maxStorage; }
  get customData(): Record<string, unknown> | null { return this._customData; }
  get isActive(): boolean { return this._isActive; }
  get updatedAt(): Date { return this._updatedAt; }

  upgrade(plan: PlanType, maxUsers: number, maxStorage: number): void {
    this._plan = plan;
    this._maxUsers = maxUsers;
    this._maxStorage = maxStorage;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  update(fields: Partial<Pick<TenantConfigProps, 'name' | 'logoUrl' | 'language' | 'timezone' | 'customData'>>): void {
    if (fields.name !== undefined) this._name = fields.name ?? null;
    if (fields.logoUrl !== undefined) this._logoUrl = fields.logoUrl ?? null;
    if (fields.language !== undefined) this._language = fields.language;
    if (fields.timezone !== undefined) this._timezone = fields.timezone;
    if (fields.customData !== undefined) this._customData = fields.customData ?? null;
    this._updatedAt = new Date();
  }

  toSnapshot(): TenantConfigProps {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this._name,
      logoUrl: this._logoUrl,
      language: this._language,
      timezone: this._timezone,
      plan: this._plan,
      maxUsers: this._maxUsers,
      maxStorage: this._maxStorage,
      customData: this._customData,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
