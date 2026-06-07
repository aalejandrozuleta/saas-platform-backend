export interface RateLimitProps {
  id: string;
  endpoint: string;
  maxRequests: number;
  windowSeconds: number;
  tenantId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Configuración de rate limit dinámica por endpoint y tenant. */
export class RateLimit {
  readonly id: string;
  readonly endpoint: string;
  private _maxRequests: number;
  private _windowSeconds: number;
  readonly tenantId: string | null;
  private _isActive: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: RateLimitProps) {
    this.id = props.id;
    this.endpoint = props.endpoint;
    this._maxRequests = props.maxRequests;
    this._windowSeconds = props.windowSeconds;
    this.tenantId = props.tenantId ?? null;
    this._isActive = props.isActive;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get maxRequests(): number { return this._maxRequests; }
  get windowSeconds(): number { return this._windowSeconds; }
  get isActive(): boolean { return this._isActive; }
  get updatedAt(): Date { return this._updatedAt; }

  update(maxRequests: number, windowSeconds: number): void {
    this._maxRequests = maxRequests;
    this._windowSeconds = windowSeconds;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  toSnapshot(): RateLimitProps {
    return {
      id: this.id,
      endpoint: this.endpoint,
      maxRequests: this._maxRequests,
      windowSeconds: this._windowSeconds,
      tenantId: this.tenantId,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
