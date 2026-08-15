import { type Provider } from '@nestjs/common';
import {
  COMPANY_MEMBERSHIP_REPOSITORY,
  COMPANY_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { AUTH_SERVICE_CLIENT } from '@domain/token/services.tokens';
import { CompanyPrismaRepository } from '@infrastructure/persistence/prisma/company.prisma.repository';
import { CompanyMembershipPrismaRepository } from '@infrastructure/persistence/prisma/company-membership.prisma.repository';
import { AuthServiceHttpClient } from '@infrastructure/http/auth-service.client';

/**
 * Bindings entre los puertos del dominio y sus implementaciones de
 * infraestructura para el módulo Company.
 */
export const companyProviders: Provider[] = [
  { provide: COMPANY_REPOSITORY, useClass: CompanyPrismaRepository },
  { provide: COMPANY_MEMBERSHIP_REPOSITORY, useClass: CompanyMembershipPrismaRepository },
  { provide: AUTH_SERVICE_CLIENT, useClass: AuthServiceHttpClient },
];
