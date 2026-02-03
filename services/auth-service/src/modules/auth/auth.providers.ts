import { Provider } from '@nestjs/common';
import { UserRepository } from '@domain/repositories/user.repository';
import { UserPrismaRepository } from '@infrastructure/persistence/prisma/user.prisma.repository';
import { PasswordHasherService } from '@infrastructure/crypto/password-hasher.service';

/**
 * Providers del módulo Auth
 */
export const authProviders: Provider[] = [
  {
    provide: UserRepository,
    useClass: UserPrismaRepository,
  },
  PasswordHasherService,
];
