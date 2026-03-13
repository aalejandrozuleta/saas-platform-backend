import { type User } from '../entities/user/user.entity';
import { type EmailVO } from '../value-objects/email.vo';

/**
 * Contrato de persistencia de usuarios
 * Usado también como Injection Token
 */
export abstract class UserRepository {
  abstract findByEmail(email: EmailVO): Promise<User | null>;
  abstract save(user: User): Promise<void>;
}
