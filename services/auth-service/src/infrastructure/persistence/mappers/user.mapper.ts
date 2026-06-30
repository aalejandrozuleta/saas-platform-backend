import { EmailVO } from '@domain/value-objects/email.vo';
import { User } from '@domain/entities/user/user.entity';
import { type UserProps } from '@domain/entities/user/user.props';
import { UserRole as DomainUserRole } from '@domain/enums/user-role.enum';
import { UserStatus as DomainUserStatus } from '@domain/enums/user-status.enum';

import {
  UserRole as PrismaUserRole,
  UserStatus as PrismaUserStatus,
} from '../../../generated/prisma';

/**
 * Mapper de Usuario
 * Traduce entre modelo de persistencia (Prisma) y dominio
 */
export class UserMapper {
  /**
   * Convierte un registro de base de datos a entidad de dominio
   */
  static toDomain(raw: {
    id: string;
    email: string;
    passwordHash: string;
    role: PrismaUserRole;
    status: PrismaUserStatus;
    emailVerified: boolean;
    failedLoginAttempts: number;
    blockedUntil: Date | null;
    lockoutCount: number;
    lastLoginAt: Date | null;
    createdAt: Date;
    emailVerificationToken?: string | null;
    emailVerificationExpiresAt?: Date | null;
  }): User {
    const props: UserProps = {
      id: raw.id,
      email: EmailVO.create(raw.email),
      passwordHash: raw.passwordHash,
      role: UserMapper.toDomainRole(raw.role),
      status: UserMapper.toDomainStatus(raw.status),
      emailVerified: raw.emailVerified,
      failedLoginAttempts: raw.failedLoginAttempts,
      blockedUntil: raw.blockedUntil ?? undefined,
      lockoutCount: raw.lockoutCount,
      lastLoginAt: raw.lastLoginAt ?? undefined,
      createdAt: raw.createdAt,
      emailVerificationToken: raw.emailVerificationToken ?? undefined,
      emailVerificationExpiresAt: raw.emailVerificationExpiresAt ?? undefined,
    };

    return User.fromPersistence(props);
  }

  /**
   * Convierte una entidad de dominio a modelo de persistencia
   */
  static toPersistence(user: User): {
    id: string;
    email: string;
    passwordHash: string;
    role: PrismaUserRole;
    status: PrismaUserStatus;
    emailVerified: boolean;
    failedLoginAttempts: number;
    blockedUntil?: Date;
    emailVerificationToken?: string | null;
    emailVerificationExpiresAt?: Date | null;
  } {
    return {
      id: user.id,
      email: user.email.getValue(),
      passwordHash: user.passwordHash,
      role: UserMapper.toPrismaRole(user.role),
      status: UserMapper.toPrismaStatus(user.status),
      emailVerified: user.emailVerified,
      failedLoginAttempts: user.failedLoginAttempts,
      blockedUntil: user.blockedUntil,
      emailVerificationToken: user.emailVerificationToken ?? null,
      emailVerificationExpiresAt: user.emailVerificationExpiresAt ?? null,
    };
  }

  // ===== Role mapping =====

  private static toDomainRole(role: PrismaUserRole): DomainUserRole {
    switch (role) {
      case PrismaUserRole.SUPER_ADMIN:    return DomainUserRole.SUPER_ADMIN;
      case PrismaUserRole.BUSINESS_OWNER: return DomainUserRole.BUSINESS_OWNER;
      case PrismaUserRole.ACCOUNTANT:     return DomainUserRole.ACCOUNTANT;
      case PrismaUserRole.EMPLOYEE:       return DomainUserRole.EMPLOYEE;
      case PrismaUserRole.CUSTOMER:       return DomainUserRole.CUSTOMER;
      default:                            return UserMapper.assertUnreachable(role);
    }
  }

  private static toPrismaRole(role: DomainUserRole): PrismaUserRole {
    switch (role) {
      case DomainUserRole.SUPER_ADMIN:    return PrismaUserRole.SUPER_ADMIN;
      case DomainUserRole.BUSINESS_OWNER: return PrismaUserRole.BUSINESS_OWNER;
      case DomainUserRole.ACCOUNTANT:     return PrismaUserRole.ACCOUNTANT;
      case DomainUserRole.EMPLOYEE:       return PrismaUserRole.EMPLOYEE;
      case DomainUserRole.CUSTOMER:       return PrismaUserRole.CUSTOMER;
      default:                            return UserMapper.assertUnreachable(role);
    }
  }

  // ===== Status mapping =====

  private static toDomainStatus(
    status: PrismaUserStatus,
  ): DomainUserStatus {
    switch (status) {
      case PrismaUserStatus.ACTIVE:
        return DomainUserStatus.ACTIVE;
      case PrismaUserStatus.PENDING:
        return DomainUserStatus.PENDING;
      case PrismaUserStatus.BLOCKED:
        return DomainUserStatus.BLOCKED;
      default:
        return UserMapper.assertUnreachable(status);
    }
  }

  private static toPrismaStatus(
    status: DomainUserStatus,
  ): PrismaUserStatus {
    switch (status) {
      case DomainUserStatus.ACTIVE:
        return PrismaUserStatus.ACTIVE;
      case DomainUserStatus.PENDING:
        return PrismaUserStatus.PENDING;
      case DomainUserStatus.BLOCKED:
        return PrismaUserStatus.BLOCKED;
      default:
        return UserMapper.assertUnreachable(status);
    }
  }

  /**
   * Garantiza exhaustividad en enums
   */
  private static assertUnreachable(value: never): never {
    throw new Error(`Estado no soportado: ${String(value)}`);
  }
}