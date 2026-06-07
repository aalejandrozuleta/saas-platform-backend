import { IpRuleType } from '@domain/enums/ip-rule-type.enum';

export interface IpRuleProps {
  id: string;
  ip: string;
  cidr?: string | null;
  type: IpRuleType;
  tenantId?: string | null;
  reason?: string | null;
  expiresAt?: Date | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Regla de IP para whitelist o blacklist.
 *
 * @remarks
 * Permite bloquear o permitir IPs específicas o rangos CIDR.
 * Las reglas con `expiresAt` en el pasado se ignoran en la evaluación.
 */
export class IpRule {
  readonly id: string;
  readonly ip: string;
  readonly cidr: string | null;
  readonly type: IpRuleType;
  readonly tenantId: string | null;
  readonly reason: string | null;
  private _expiresAt: Date | null;
  readonly createdBy: string | null;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: IpRuleProps) {
    this.id = props.id;
    this.ip = props.ip;
    this.cidr = props.cidr ?? null;
    this.type = props.type;
    this.tenantId = props.tenantId ?? null;
    this.reason = props.reason ?? null;
    this._expiresAt = props.expiresAt ?? null;
    this.createdBy = props.createdBy ?? null;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get expiresAt(): Date | null { return this._expiresAt; }
  get updatedAt(): Date { return this._updatedAt; }

  isExpired(): boolean {
    if (!this._expiresAt) return false;
    return this._expiresAt < new Date();
  }

  isActive(): boolean {
    return !this.isExpired();
  }

  toSnapshot(): IpRuleProps {
    return {
      id: this.id,
      ip: this.ip,
      cidr: this.cidr,
      type: this.type,
      tenantId: this.tenantId,
      reason: this.reason,
      expiresAt: this._expiresAt,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
