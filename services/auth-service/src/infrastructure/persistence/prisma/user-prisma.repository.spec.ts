
import { EmailVO } from '@domain/value-objects/email.vo';
import { User } from '@domain/entities/user.entity';
import { UserStatus } from '@domain/enums/user-status.enum';

import { PrismaService } from '../sql/prisma.service';
import { UserMapper } from '../mappers/user.mapper';

import { UserPrismaRepository } from './user.prisma.repository';



jest.mock('../mappers/user.mapper', () => ({
  UserMapper: {
    toDomain: jest.fn(),
    toPersistence: jest.fn(),
  },
}));

describe('UserPrismaRepository', () => {
  let repository: UserPrismaRepository;
  let prisma: PrismaService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    prisma = prismaMock as unknown as PrismaService;
    repository = new UserPrismaRepository(prisma);
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('debe retornar un User cuando existe', async () => {
      const email = EmailVO.create('test@example.com');

      const prismaUser = {
        id: 'uuid',
        email: email.getValue(),
        passwordHash: 'hash',
        status: 'ACTIVE',
        createdAt: new Date(),
      };

      const domainUser = User.fromPersistence({
        id: prismaUser.id,
        email,
        passwordHash: prismaUser.passwordHash,
        status: UserStatus.ACTIVE,
        createdAt: prismaUser.createdAt,
      });

      // 🔑 CAST CORRECTO (SOLO EL MÉTODO)
      (
        prismaMock.user.findUnique as jest.Mock
      ).mockResolvedValue(prismaUser);

      (UserMapper.toDomain as jest.Mock).mockReturnValue(domainUser);

      const result = await repository.findByEmail(email);

      expect(result).toBe(domainUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: email.getValue() },
      });
    });

    it('debe retornar null si no existe', async () => {
      const email = EmailVO.create('notfound@example.com');

      (
        prismaMock.user.findUnique as jest.Mock
      ).mockResolvedValue(null);

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
        status: 'ACTIVE',
      };

      (UserMapper.toPersistence as jest.Mock).mockReturnValue(
        persistenceUser,
      );

      await repository.save(user);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: persistenceUser,
      });
    });
  });
});
