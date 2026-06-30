import { type User } from '../entities/user/user.entity';
import { type EmailVO } from '../value-objects/email.vo';

/**
 * Contrato de persistencia de usuarios
 * Usado también como Injection Token
 */
export abstract class UserRepository {
  abstract findByEmail(email: EmailVO): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByVerificationToken(token: string): Promise<User | null>;
  abstract save(user: User): Promise<void>;
  abstract update(user: User): Promise<void>;
  abstract updatePasswordHash(userId: string, passwordHash: string): Promise<void>;
  abstract updateLastLogin(userId: string, now: Date): Promise<void>;
}
