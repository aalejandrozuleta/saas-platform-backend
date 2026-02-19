import { Provider } from '@nestjs/common';
import { PasswordHasherService } from '@infrastructure/crypto/password-hasher.service';
import { DOMAIN_EVENT_BUS, PASSWORD_HASHER, TOKEN_SERVICE, UNIT_OF_WORK } from '@domain/token/services.tokens';
import { NestDomainEventBus } from '@infrastructure/messaging/nest-domain-event.bus';
import { DEVICE_REPOSITORY, REFRESH_TOKEN_REPOSITORY, SECURITY_REPOSITORY, SESSION_REPOSITORY, USER_REPOSITORY } from '@domain/token/repositories.tokens';
import { UserPrismaRepository } from '@infrastructure/persistence/prisma/user.prisma.repository';
import { PrismaUnitOfWork } from '@infrastructure/persistence/prisma/prisma-unit-of-work';
import { SecurityPrismaRepository } from '@infrastructure/persistence/prisma/security-prisma.repository';
import { SystemClock } from '@application/services/system-clock.service';
import { DevicePrismaRepository } from '@infrastructure/persistence/prisma/device.prisma.repository';
import { SessionPrismaRepository } from '@infrastructure/persistence/prisma/session-prisma.repository';
import { LoginPolicy } from '@domain/policies/login.policy';
import { JwtTokenService } from '@infrastructure/security/jwt-token.service';
import { RefreshTokenPrismaRepository } from '@infrastructure/persistence/prisma/refresh-token-prisma.repository';

/**
 * Providers del módulo Auth
 */
export const authProviders: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
  { provide: SECURITY_REPOSITORY, useClass: SecurityPrismaRepository },
  { provide: DEVICE_REPOSITORY, useClass: DevicePrismaRepository },
  { provide: SESSION_REPOSITORY, useClass: SessionPrismaRepository },
  { provide: REFRESH_TOKEN_REPOSITORY, useClass: RefreshTokenPrismaRepository },
  { provide: PASSWORD_HASHER, useClass: PasswordHasherService },
  { provide: TOKEN_SERVICE, useClass: JwtTokenService },
  { provide: UNIT_OF_WORK, useClass: PrismaUnitOfWork },
  { provide: DOMAIN_EVENT_BUS, useClass: NestDomainEventBus },
  { provide: 'CLOCK', useClass: SystemClock },

  LoginPolicy,
];

