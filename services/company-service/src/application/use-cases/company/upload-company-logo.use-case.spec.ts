import { ErrorCode } from '@saas/shared';
import { Company } from '@domain/entities/company/company.entity';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { UploadCompanyLogoUseCase } from './upload-company-logo.use-case';

describe('UploadCompanyLogoUseCase', () => {
  let useCase: UploadCompanyLogoUseCase;
  let companyRepository: any;
  let companyMembershipRepository: any;
  let imageStorage: any;
  let imageProcessor: any;

  const existingCompany = Company.create({
    id: 'c-1',
    name: 'Acme',
    email: 'contacto@acme.com',
    phone: '+57 3001234567',
    address: 'Calle 123',
    city: 'Bogotá',
  });

  const ownerMembership = CompanyMembership.create({
    id: 'm-1',
    companyId: 'c-1',
    userId: 'u-1',
    role: MembershipRole.OWNER,
    status: MembershipStatus.ACTIVE,
  });

  const workerMembership = CompanyMembership.create({
    id: 'm-2',
    companyId: 'c-1',
    userId: 'u-2',
    role: MembershipRole.WORKER,
    status: MembershipStatus.ACTIVE,
  });

  const sanitizedImage = {
    buffer: Buffer.from('sanitized'),
    contentType: 'image/webp',
    extension: 'webp',
  };

  beforeEach(() => {
    companyRepository = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      createWithOwnerMembership: jest.fn(),
    };

    companyMembershipRepository = {
      findByCompanyAndUser: jest.fn(),
      save: jest.fn(),
    };

    imageStorage = {
      upload: jest.fn().mockResolvedValue('https://storage.example.com/logos/c-1.webp'),
    };

    imageProcessor = {
      sanitize: jest.fn().mockResolvedValue(sanitizedImage),
    };

    useCase = new UploadCompanyLogoUseCase(
      companyRepository,
      companyMembershipRepository,
      imageStorage,
      imageProcessor,
    );
  });

  it('debe sanear la imagen, subirla y actualizar logoUrl', async () => {
    companyMembershipRepository.findByCompanyAndUser.mockResolvedValue(ownerMembership);
    companyRepository.findById.mockResolvedValue(existingCompany);

    const updated = await useCase.execute('u-1', 'c-1', { buffer: Buffer.from('raw-upload') });

    expect(companyMembershipRepository.findByCompanyAndUser).toHaveBeenCalledWith('c-1', 'u-1');
    expect(imageProcessor.sanitize).toHaveBeenCalledWith(Buffer.from('raw-upload'));
    expect(imageStorage.upload).toHaveBeenCalledWith(
      'logos/c-1.webp',
      sanitizedImage.buffer,
      'image/webp',
    );
    expect(updated.logoUrl).toBe('https://storage.example.com/logos/c-1.webp');
    expect(companyRepository.update).toHaveBeenCalledWith(updated);
  });

  it('debe lanzar VALIDATION_ERROR si el archivo no decodifica como una imagen soportada, sin tocar storage/persistencia', async () => {
    companyMembershipRepository.findByCompanyAndUser.mockResolvedValue(ownerMembership);
    companyRepository.findById.mockResolvedValue(existingCompany);
    imageProcessor.sanitize.mockRejectedValue(new Error('UNSUPPORTED_IMAGE_FORMAT:undecodable'));

    await expect(
      useCase.execute('u-1', 'c-1', { buffer: Buffer.from('not-an-image') }),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_ERROR });

    expect(imageStorage.upload).not.toHaveBeenCalled();
    expect(companyRepository.update).not.toHaveBeenCalled();
  });

  it('debe lanzar FORBIDDEN si el requester no puede gestionar miembros, sin buscar la empresa ni sanear', async () => {
    companyMembershipRepository.findByCompanyAndUser.mockResolvedValue(workerMembership);

    await expect(
      useCase.execute('u-2', 'c-1', { buffer: Buffer.from('raw-upload') }),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });

    expect(companyRepository.findById).not.toHaveBeenCalled();
    expect(imageProcessor.sanitize).not.toHaveBeenCalled();
    expect(imageStorage.upload).not.toHaveBeenCalled();
  });

  it('debe lanzar COMPANY_NOT_FOUND si la empresa no existe, sin sanear la imagen', async () => {
    companyMembershipRepository.findByCompanyAndUser.mockResolvedValue(ownerMembership);
    companyRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('u-1', 'c-1', { buffer: Buffer.from('raw-upload') }),
    ).rejects.toMatchObject({ code: ErrorCode.COMPANY_NOT_FOUND });

    expect(imageProcessor.sanitize).not.toHaveBeenCalled();
    expect(imageStorage.upload).not.toHaveBeenCalled();
  });
});
