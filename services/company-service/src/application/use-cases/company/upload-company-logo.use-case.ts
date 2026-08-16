import { Inject } from '@nestjs/common';
import { Company } from '@domain/entities/company/company.entity';
import { type CompanyRepository } from '@domain/repositories/company.repository';
import { type CompanyMembershipRepository } from '@domain/repositories/company-membership.repository';
import {
  COMPANY_REPOSITORY,
  COMPANY_MEMBERSHIP_REPOSITORY,
} from '@domain/token/repositories.tokens';
import { IMAGE_STORAGE, IMAGE_PROCESSOR } from '@domain/token/services.tokens';
import { type ImageStoragePort } from '@application/ports/image-storage.port';
import { type ImageProcessorPort } from '@application/ports/image-processor.port';
import { DomainErrorFactory } from '@domain/errors/domain-error.factory';

/**
 * Caso de uso: sube el logo de la empresa y actualiza `logoUrl`.
 *
 * @remarks
 * Solo quien puede gestionar miembros (`OWNER`/`MANAGER`, ver
 * `CompanyMembership.canManageMembers()`) puede cambiar el logo — mismo
 * check que `InviteMemberUseCase`, evaluado ANTES de tocar la empresa o el
 * storage.
 *
 * No confía en el `mimetype` que declara el cliente (viene del header
 * `Content-Type`, trivial de falsificar): el archivo se decodifica y
 * re-codifica de verdad vía {@link ImageProcessorPort} antes de subirlo,
 * lo que garantiza que solo se almacenan imágenes rasterizadas válidas.
 */
export class UploadCompanyLogoUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,

    @Inject(COMPANY_MEMBERSHIP_REPOSITORY)
    private readonly companyMembershipRepository: CompanyMembershipRepository,

    @Inject(IMAGE_STORAGE)
    private readonly imageStorage: ImageStoragePort,

    @Inject(IMAGE_PROCESSOR)
    private readonly imageProcessor: ImageProcessorPort,
  ) {}

  async execute(
    requesterUserId: string,
    companyId: string,
    file: { buffer: Buffer },
  ): Promise<Company> {
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

    const sanitized = await this.sanitizeOrThrow(file.buffer);

    const key = `logos/${companyId}.${sanitized.extension}`;

    const logoUrl = await this.imageStorage.upload(key, sanitized.buffer, sanitized.contentType);

    const updated = existing.updateLogo(logoUrl);

    await this.companyRepository.update(updated);

    return updated;
  }

  private async sanitizeOrThrow(buffer: Buffer) {
    try {
      return await this.imageProcessor.sanitize(buffer);
    } catch {
      throw DomainErrorFactory.invalidLogoType();
    }
  }
}
