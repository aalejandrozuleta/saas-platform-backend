export interface FeatureFlagProps {
  id: string;
  /** Nombre del servicio o módulo: "auth-service", "billing", "dashboard", etc. */
  key: string;
  enabled: boolean;
  /** null = aplica a todos los entornos */
  environment?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Feature flag de plataforma.
 *
 * Permite a super-admins apagar o encender servicios y módulos
 * sin necesidad de redesplegar.
 */
export class FeatureFlag {
  readonly id: string;
  readonly key: string;
  private _enabled: boolean;
  readonly environment: string | null;
  readonly description: string | null;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: FeatureFlagProps) {
    this.id = props.id;
    this.key = props.key;
    this._enabled = props.enabled;
    this.environment = props.environment ?? null;
    this.description = props.description ?? null;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get enabled(): boolean { return this._enabled; }
  get updatedAt(): Date { return this._updatedAt; }

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
      environment: this.environment,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
