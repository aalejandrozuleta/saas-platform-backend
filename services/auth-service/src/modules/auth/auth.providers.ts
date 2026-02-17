import { Provider } from '@nestjs/common';
import { UserPrismaRepository } from '@infrastructure/persistence/prisma/user.prisma.repository';
import { PasswordHasherService } from '@infrastructure/crypto/password-hasher.service';
import { USER_REPOSITORY } from '@domain/token/user-repository.token';
import { PASSWORD_HASHER } from '@domain/token/password-hasher.token';
import { AUDIT_LOGGER_KEY } from '@domain/token/audit-logger.token';
import { AuditService } from '@application/audit/audit.service';
import { DOMAIN_EVENT_BUS } from '@domain/token/domain-event.token';
import { NestDomainEventBus } from '@application/events/nest-domain-event.bus';

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
    provide: AUDIT_LOGGER_KEY,
    useClass: AuditService,
  },
  {
    provide: DOMAIN_EVENT_BUS,
    useClass: NestDomainEventBus,
  },
];
