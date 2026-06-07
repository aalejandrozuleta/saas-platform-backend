export interface PasswordPolicyProps {
  id: string;
  tenantId?: string | null;
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  maxAgeDays?: number | null;
  historyCount: number;
  maxConcurrentSessions: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Política de contraseñas y sesiones concurrentes.
 *
 * @remarks
 * Cuando `tenantId` es `null`, aplica como política global por defecto.
 * Un tenant puede sobrescribir la política con su propia instancia.
 */
export class PasswordPolicy {
  readonly id: string;
  readonly tenantId: string | null;
  private _minLength: number;
  private _requireUppercase: boolean;
  private _requireLowercase: boolean;
  private _requireNumbers: boolean;
  private _requireSymbols: boolean;
  private _maxAgeDays: number | null;
  private _historyCount: number;
  private _maxConcurrentSessions: number;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PasswordPolicyProps) {
    this.id = props.id;
    this.tenantId = props.tenantId ?? null;
    this._minLength = props.minLength;
    this._requireUppercase = props.requireUppercase;
    this._requireLowercase = props.requireLowercase;
    this._requireNumbers = props.requireNumbers;
    this._requireSymbols = props.requireSymbols;
    this._maxAgeDays = props.maxAgeDays ?? null;
    this._historyCount = props.historyCount;
    this._maxConcurrentSessions = props.maxConcurrentSessions;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get minLength(): number { return this._minLength; }
  get requireUppercase(): boolean { return this._requireUppercase; }
  get requireLowercase(): boolean { return this._requireLowercase; }
  get requireNumbers(): boolean { return this._requireNumbers; }
  get requireSymbols(): boolean { return this._requireSymbols; }
  get maxAgeDays(): number | null { return this._maxAgeDays; }
  get historyCount(): number { return this._historyCount; }
  get maxConcurrentSessions(): number { return this._maxConcurrentSessions; }
  get updatedAt(): Date { return this._updatedAt; }

  update(fields: Partial<Omit<PasswordPolicyProps, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): void {
    if (fields.minLength !== undefined) this._minLength = fields.minLength;
    if (fields.requireUppercase !== undefined) this._requireUppercase = fields.requireUppercase;
    if (fields.requireLowercase !== undefined) this._requireLowercase = fields.requireLowercase;
    if (fields.requireNumbers !== undefined) this._requireNumbers = fields.requireNumbers;
    if (fields.requireSymbols !== undefined) this._requireSymbols = fields.requireSymbols;
    if (fields.maxAgeDays !== undefined) this._maxAgeDays = fields.maxAgeDays ?? null;
    if (fields.historyCount !== undefined) this._historyCount = fields.historyCount;
    if (fields.maxConcurrentSessions !== undefined) this._maxConcurrentSessions = fields.maxConcurrentSessions;
    this._updatedAt = new Date();
  }

  toSnapshot(): PasswordPolicyProps {
    return {
      id: this.id,
      tenantId: this.tenantId,
      minLength: this._minLength,
      requireUppercase: this._requireUppercase,
      requireLowercase: this._requireLowercase,
      requireNumbers: this._requireNumbers,
      requireSymbols: this._requireSymbols,
      maxAgeDays: this._maxAgeDays,
      historyCount: this._historyCount,
      maxConcurrentSessions: this._maxConcurrentSessions,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
