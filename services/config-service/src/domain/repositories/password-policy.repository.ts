import { PasswordPolicy } from '@domain/entities/password-policy/password-policy.entity';

export interface PasswordPolicyRepository {
  findByTenantId(tenantId: string | null): Promise<PasswordPolicy | null>;
  save(policy: PasswordPolicy): Promise<PasswordPolicy>;
}
