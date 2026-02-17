import { EmailVO } from '@domain/value-objects/email.vo';
import { User } from '@domain/entities/user/user.entity';
import { UserProps } from '@domain/entities/user/user.props';
import { UserStatus as DomainUserStatus } from '@domain/enums/user-status.enum';

import {
  UserStatus as PrismaUserStatus,
} from '../../../../generated/prisma/enums';

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
    status: PrismaUserStatus;
    emailVerified: boolean;
    failedLoginAttempts: number;
    blockedUntil: Date | null;
    createdAt: Date;
  }): User {
    const props: UserProps = {
      id: raw.id,
      email: EmailVO.create(raw.email),
      passwordHash: raw.passwordHash,
      status: UserMapper.toDomainStatus(raw.status),
      emailVerified: raw.emailVerified,
      failedLoginAttempts: raw.failedLoginAttempts,
      blockedUntil: raw.blockedUntil ?? undefined,
      createdAt: raw.createdAt,
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
    status: PrismaUserStatus;
    emailVerified: boolean;
    failedLoginAttempts: number;
    blockedUntil?: Date;
  } {
    return {
      id: user.id,
      email: user.email.getValue(),
      passwordHash: user.passwordHash,
      status: UserMapper.toPrismaStatus(user.status),
      emailVerified: user.emailVerified,
      failedLoginAttempts: user.failedLoginAttempts,
      blockedUntil: user.blockedUntil,
    };
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