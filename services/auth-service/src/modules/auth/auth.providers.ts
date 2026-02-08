import { Provider } from '@nestjs/common';
import { UserPrismaRepository } from '@infrastructure/persistence/prisma/user.prisma.repository';
import { PasswordHasherService } from '@infrastructure/crypto/password-hasher.service';
import { USER_REPOSITORY } from '@domain/token/user-repository.token';
import { LoggerProvider } from '@saas/shared';

/**
 * Providers del módulo Auth
 */
export const authProviders: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserPrismaRepository,
  },
  PasswordHasherService,
  LoggerProvider,
];