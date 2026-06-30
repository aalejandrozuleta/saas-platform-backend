import { Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/repositories/user.repository';
import { EmailVO } from '@domain/value-objects/email.vo';
import { User } from '@domain/entities/user/user.entity';

import { UserMapper } from '../mappers/user.mapper';

import { PrismaService } from './prisma.service';

/**
 * Repositorio Prisma para usuarios
 */
@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: EmailVO): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.getValue(),
      },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    return user ? UserMapper.toDomain(user) : null;
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.create({
      data: UserMapper.toPersistence(user),
    });
  }

  async update(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);
    await this.prisma.user.update({
      where: { id: user.id },
      data,
    });
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async updateLastLogin(userId: string, now: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: now },
    });
  }
}
