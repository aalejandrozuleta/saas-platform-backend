import { EmailVO } from '@domain/value-objects/email.vo';
import { User } from '@domain/entities/user/user.entity';
import { UserStatus } from '@domain/enums/user-status.enum';
import { UserStatus as PrismaUserStatus } from '@prisma/client';

import { UserMapper } from '../mappers/user.mapper';

import { PrismaService } from './prisma.service';
import { UserPrismaRepository } from './user.prisma.repository';

jest.mock('../mappers/user.mapper', () => ({
  UserMapper: {
    toDomain: jest.fn(),
    toPersistence: jest.fn(),
  },
}));

describe('UserPrismaRepository', () => {
  let repository: UserPrismaRepository;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    repository = new UserPrismaRepository(
      prismaMock as unknown as PrismaService,
    );
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('debe retornar un User cuando existe', async () => {
      const email = EmailVO.create('test@example.com');

      const prismaUser = {
        id: 'uuid',
        email: email.getValue(),
        passwordHash: 'hash',
        status: PrismaUserStatus.ACTIVE,
        emailVerified: false,
        failedLoginAttempts: 0,
        blockedUntil: null,
        createdAt: new Date(),
      };

      const domainUser = User.fromPersistence({
        id: prismaUser.id,
        email,
        passwordHash: prismaUser.passwordHash,
        status: UserStatus.ACTIVE,
        emailVerified: false,
        failedLoginAttempts: 0,
        blockedUntil: undefined,
        createdAt: prismaUser.createdAt,
      });

      prismaMock.user.findUnique.mockResolvedValue(prismaUser);
      (UserMapper.toDomain as jest.Mock).mockReturnValue(domainUser);

      const result = await repository.findByEmail(email);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: email.getValue() },
      });

      expect(UserMapper.toDomain).toHaveBeenCalledWith(prismaUser);

      expect(result).toBe(domainUser);
    });

    it('debe retornar null si no existe', async () => {
      const email = EmailVO.create('notfound@example.com');

      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail(email);

      expect(result).toBeNull();
      expect(UserMapper.toDomain).not.toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('debe persistir un usuario', async () => {
      const user = User.create({
        id: 'uuid',
        email: EmailVO.create('save@example.com'),
        passwordHash: 'hashed-password',
      });

      const persistenceUser = {
        id: user.id,
        email: user.email.getValue(),
        passwordHash: user.passwordHash,
        status: PrismaUserStatus.ACTIVE,
        emailVerified: false,
        failedLoginAttempts: 0,
        blockedUntil: undefined,
      };

      (UserMapper.toPersistence as jest.Mock).mockReturnValue(
        persistenceUser,
      );

      await repository.save(user);

      expect(UserMapper.toPersistence).toHaveBeenCalledWith(user);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: persistenceUser,
      });
    });
  });
});