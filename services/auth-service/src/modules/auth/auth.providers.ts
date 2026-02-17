import { Provider } from '@nestjs/common';
import { PasswordHasherService } from '@infrastructure/crypto/password-hasher.service';
import { DOMAIN_EVENT_BUS, PASSWORD_HASHER } from '@domain/token/services.tokens';
import { NestDomainEventBus } from '@infrastructure/messaging/nest-domain-event.bus';
import { USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { UserPrismaRepository } from '@infrastructure/persistence/prisma/user.prisma.repository';

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
];

