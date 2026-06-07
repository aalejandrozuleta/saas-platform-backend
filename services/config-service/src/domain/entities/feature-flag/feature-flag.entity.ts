export interface FeatureFlagProps {
  id: string;
  key: string;
  enabled: boolean;
  tenantId?: string | null;
  role?: string | null;
  environment?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entidad Feature Flag.
 *
 * @remarks
 * Permite activar o desactivar funcionalidades granularmente por
 * tenant, rol o entorno sin necesidad de redesplegar el servicio.
 */
export class FeatureFlag {
  readonly id: string;
  readonly key: string;
  private _enabled: boolean;
  readonly tenantId: string | null;
  readonly role: string | null;
  readonly environment: string | null;
  readonly description: string | null;
  readonly metadata: Record<string, unknown> | null;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: FeatureFlagProps) {
    this.id = props.id;
    this.key = props.key;
    this._enabled = props.enabled;
    this.tenantId = props.tenantId ?? null;
    this.role = props.role ?? null;
    this.environment = props.environment ?? null;
    this.description = props.description ?? null;
    this.metadata = props.metadata ?? null;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  enable(): void {
    this._enabled = true;
    this._updatedAt = new Date();
  }

  disable(): void {
    this._enabled = false;
    this._updatedAt = new Date();
  }

  toggle(): void {
    this._enabled = !this._enabled;
    this._updatedAt = new Date();
  }

  toSnapshot(): FeatureFlagProps {
    return {
      id: this.id,
      key: this.key,
      enabled: this._enabled,
      tenantId: this.tenantId,
      role: this.role,
      environment: this.environment,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
