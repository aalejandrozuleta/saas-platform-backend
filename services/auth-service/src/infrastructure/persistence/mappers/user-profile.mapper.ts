import { UserProfile } from '@domain/entities/user-profile/user-profile.entity';
import { type DocumentType } from '@domain/enums/document-type.enum';

import { type UserProfile as PrismaUserProfile } from '../../../generated/prisma';

/**
 * Mapper entre Prisma UserProfile y UserProfile de dominio
 */
export class UserProfileMapper {
  static toDomain(prisma: PrismaUserProfile): UserProfile {
    return UserProfile.fromPersistence({
      userId: prisma.userId,
      firstName: prisma.firstName,
      lastName: prisma.lastName,
      phone: prisma.phone ?? undefined,
      documentType: (prisma.documentType as DocumentType | null) ?? undefined,
      documentNumber: prisma.documentNumber ?? undefined,
      avatarUrl: prisma.avatarUrl ?? undefined,
      dataProcessingAcceptedAt: prisma.dataProcessingAcceptedAt ?? undefined,
      termsAcceptedAt: prisma.termsAcceptedAt ?? undefined,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  static toPersistence(profile: UserProfile) {
    return {
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone ?? null,
      documentType: profile.documentType ?? null,
      documentNumber: profile.documentNumber ?? null,
      avatarUrl: profile.avatarUrl ?? null,
      dataProcessingAcceptedAt: profile.dataProcessingAcceptedAt,
      termsAcceptedAt: profile.termsAcceptedAt,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
