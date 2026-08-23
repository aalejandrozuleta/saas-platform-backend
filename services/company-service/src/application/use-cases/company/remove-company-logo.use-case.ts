import { Inject } from '@nestjs/common';
import { type Company } from '@domain/entities/company/company.entity';
import { type CompanyRepository } from '@domain/repositories/company.repository';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import {
  COMPANY_REPOSITORY,
  COMPANY_MEMBERSHIP_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { IMAGE_STORAGE } from '@domain/token/services.tokens';
import { type ImageStoragePort } from '@application/ports/image-storage.port';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: quita el logo de la empresa sin reemplazarlo.
 *
 * @remarks
 * Mismo check de autorización que `UploadCompanyLogoUseCase`
 * (`canManageMembers()`, evaluado antes de tocar storage). Idempotente: si
 * la empresa ya no tiene logo, no falla ni llama al storage, simplemente
 * devuelve la empresa tal cual.
 */
export class RemoveCompanyLogoUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,

    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,

    @Inject(IMAGE_STORAGE)
    private readonly imageStorage: ImageStoragePort,
  ) {}

  async execute(requesterUserId: string, companyId: string): Promise<Company> {
    const requesterMembership = await this.companyMembershipRepository.findByCompanyAndUser(
      companyId,
      requesterUserId,
    );

    if (!requesterMembership?.canManageMembers()) {
      throw DomainErrorFactory.notCompanyOwner();
    }

    const existing = await this.companyRepository.findById(companyId);

    if (!existing) {
      throw DomainErrorFactory.companyNotFound();
    }

    if (!existing.logoUrl) {
      return existing;
    }

    await this.imageStorage.deleteByUrl(existing.logoUrl);

    const updated = existing.removeLogo();

    await this.companyRepository.update(updated);

    return updated;
  }
}
