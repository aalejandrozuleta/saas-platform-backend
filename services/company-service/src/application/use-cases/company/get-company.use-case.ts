import { Inject } from '@nestjs/common';
import { type Company } from '@domain/entities/company/company.entity';
import { type CompanyRepository } from '@domain/repositories/company.repository';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import {
  COMPANY_MEMBERSHIP_REPOSITORY,
  COMPANY_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: obtener una empresa por id.
 *
 * @remarks
 * Solo un miembro **activo** de la empresa puede leerla. Cuando el
 * solicitante no tiene membresía activa se responde `COMPANY_NOT_FOUND`
 * (404) en vez de 403: un 403 confirmaría la existencia del tenant y
 * permitiría enumerar empresas ajenas probando ids.
 */
export class GetCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,
  ) {}

  async execute(userId: string, companyId: string): Promise<Company> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw DomainErrorFactory.companyNotFound();
    }

    const membership = await this.companyMembershipRepository.findByCompanyAndUser(
      companyId,
      userId,
    );

    if (!membership?.isActive()) {
      throw DomainErrorFactory.companyNotFound();
    }

    return company;
  }
}
