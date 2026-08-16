import { type Provider } from '@nestjs/common';
import { USER_PROFILE_REPOSITORY, USER_REPOSITORY } from '@domain/token/repositories.tokens';
import {
  IMAGE_STORAGE,
  IMAGE_PROCESSOR,
  PASSWORD_HASHER,
  UNIT_OF_WORK,
  DOMAIN_EVENT_BUS,
} from '@domain/token/services.tokens';
import { UserProfilePrismaRepository } from '@infrastructure/persistence/prisma/user-profile.prisma.repository';
import { UserPrismaRepository } from '@infrastructure/persistence/prisma/user.prisma.repository';
import { S3ImageStorageService } from '@infrastructure/storage/s3-image-storage.service';
import { SharpImageProcessorService } from '@infrastructure/storage/sharp-image-processor.service';
import { PasswordHasherService } from '@infrastructure/crypto/password-hasher.service';
import { PrismaUnitOfWork } from '@infrastructure/persistence/prisma/prisma-unit-of-work';
import { NestDomainEventBus } from '@infrastructure/messaging/nest-domain-event.bus';

/**
 * Providers del módulo User (perfil) — separados de `authProviders`.
 *
 * `USER_REPOSITORY` se vuelve a bindear aquí (además de en `authProviders`)
 * porque `LookupUserByEmailUseCase` vive en este módulo y NestJS resuelve
 * providers por módulo, no globalmente — `AuthModule` no exporta el suyo.
 */
export const userProviders: Provider[] = [
  { provide: USER_PROFILE_REPOSITORY, useClass: UserProfilePrismaRepository },
  { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
  { provide: IMAGE_STORAGE, useClass: S3ImageStorageService },
  { provide: IMAGE_PROCESSOR, useClass: SharpImageProcessorService },
  { provide: PASSWORD_HASHER, useClass: PasswordHasherService },
  { provide: UNIT_OF_WORK, useClass: PrismaUnitOfWork },
  { provide: DOMAIN_EVENT_BUS, useClass: NestDomainEventBus },
];
