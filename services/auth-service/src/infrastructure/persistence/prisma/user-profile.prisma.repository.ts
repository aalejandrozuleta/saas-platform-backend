import { Injectable } from '@nestjs/common';
import { UserProfileRepository } from '@domain/repositories/user-profile.repository';
import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';

import { UserProfileMapper } from '../mappers/user-profile.mapper';

import { PrismaService } from './prisma.service';

/**
 * Implementación Prisma del repositorio de perfiles de usuario.
 */
@Injectable()
export class UserProfilePrismaRepository implements UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });

    return profile ? UserProfileMapper.toDomain(profile) : null;
  }

  async save(profile: UserProfile): Promise<void> {
    await this.prisma.userProfile.create({ data: UserProfileMapper.toPersistence(profile) });
  }

  async update(profile: UserProfile): Promise<void> {
    await this.prisma.userProfile.update({
      where: { userId: profile.userId },
      data: UserProfileMapper.toPersistence(profile),
    });
  }
}
