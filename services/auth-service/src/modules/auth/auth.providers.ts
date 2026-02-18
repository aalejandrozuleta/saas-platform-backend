import { Provider } from '@nestjs/common';
import { PasswordHasherService } from '@infrastructure/crypto/password-hasher.service';
import { DOMAIN_EVENT_BUS, PASSWORD_HASHER, UNIT_OF_WORK } from '@domain/token/services.tokens';
import { NestDomainEventBus } from '@infrastructure/messaging/nest-domain-event.bus';
import { SECURITY_REPOSITORY, USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { UserPrismaRepository } from '@infrastructure/persistence/prisma/user.prisma.repository';
import { PrismaUnitOfWork } from '@infrastructure/persistence/prisma/prisma-unit-of-work';
import { SecurityPrismaRepository } from '@infrastructure/persistence/prisma/security-prisma.repository';

/**
 * Providers del módulo Auth
 */
export const authProviders: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useClass: UserPrismaRepository,
  },
  {
    provide: PASSWORD_HASHER,
    useClass: PasswordHasherService,
  },
  {
    provide: DOMAIN_EVENT_BUS,
    useClass: NestDomainEventBus,
  },
  {
    provide: UNIT_OF_WORK,
    useClass: PrismaUnitOfWork,
  },
  {
    provide: SECURITY_REPOSITORY,
    useClass: SecurityPrismaRepository,
  },
];

