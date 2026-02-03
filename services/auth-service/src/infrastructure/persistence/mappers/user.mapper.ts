import { EmailVO } from '@domain/value-objects/email.vo';
import { User } from '@domain/entities/user.entity';
import { UserStatus as DomainUserStatus } from '@domain/enums/user-status.enum';
import { UserStatus as PrismaUserStatus } from 'generated/prisma/enums';

/**
 * Mapper de Usuario
 */
export class UserMapper {
  static toDomain(raw: {
    id: string;
    email: string;
    passwordHash: string;
    status: PrismaUserStatus;
    createdAt: Date;
  }): User {
    return User.fromPersistence({
      id: raw.id,
      email: EmailVO.create(raw.email),
      passwordHash: raw.passwordHash,
      status: UserMapper.toDomainStatus(raw.status),
      createdAt: raw.createdAt,
    });
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      email: user.email.getValue(),
      passwordHash: user.passwordHash,
      status: UserMapper.toPrismaStatus(user.status),
    };
  }

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
    }
  }
}
