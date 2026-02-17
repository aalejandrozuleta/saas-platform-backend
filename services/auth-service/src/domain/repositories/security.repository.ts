/**
 * Contrato de persistencia de seguridad
 * Usado también como Injection Token
 */
export abstract class SecurityRepository {
  abstract incrementFailedLoginAttempts(userId: string): Promise<void>;
  abstract resetFailedLoginAttempts(userId: string): Promise<void>;
  abstract lockAccount(userId: string, durationMinutes: number): Promise<void>;
  abstract isAccountLocked(userId: string): Promise<boolean>;
  abstract findByUserId(userId: string): Promise<any>;
}
