import { IpRule } from '@domain/entities/ip-rule/ip-rule.entity';
import { IpRuleType } from '@domain/enums/ip-rule-type.enum';

export interface IpRuleRepository {
  findByIpAndTenant(ip: string, tenantId?: string | null): Promise<IpRule | null>;
  findById(id: string): Promise<IpRule | null>;
  findAll(type?: IpRuleType, tenantId?: string | null): Promise<IpRule[]>;
  save(rule: IpRule): Promise<IpRule>;
  delete(id: string): Promise<void>;
}
