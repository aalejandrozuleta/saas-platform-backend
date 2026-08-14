import { type Provider } from '@nestjs/common';
import { USER_PROFILE_REPOSITORY } from '@domain/token/repositories.tokens';
import { IMAGE_STORAGE, IMAGE_PROCESSOR } from '@domain/token/services.tokens';
import { UserProfilePrismaRepository } from '@infrastructure/persistence/prisma/user-profile.prisma.repository';
import { S3ImageStorageService } from '@infrastructure/storage/s3-image-storage.service';
import { SharpImageProcessorService } from '@infrastructure/storage/sharp-image-processor.service';

/**
 * Providers del módulo User (perfil) — separados de `authProviders`.
 */
export const userProviders: Provider[] = [
  { provide: USER_PROFILE_REPOSITORY, useClass: UserProfilePrismaRepository },
  { provide: IMAGE_STORAGE, useClass: S3ImageStorageService },
  { provide: IMAGE_PROCESSOR, useClass: SharpImageProcessorService },
];
