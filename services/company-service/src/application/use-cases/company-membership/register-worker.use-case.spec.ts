import { ErrorCode } from '@saas/shared';
import { Company } from '@domain/entities/company/company.entity';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { RegisterWorkerUseCase } from './register-worker.use-case';

const buildMembership = (role: MembershipRole, status: MembershipStatus) =>
  CompanyMembership.create({
    id: 'm-requester',
    companyId: 'c-1',
    userId: 'u-req',
    role,
    status,
  });

const company = Company.create({
  id: 'c-1',
  name: 'Acme',
  email: 'contacto@acme.com',
  phone: '+57 3001234567',
  address: 'Calle 123',
  city: 'Bogotá',
});

describe('RegisterWorkerUseCase', () => {
  let useCase: RegisterWorkerUseCase;
  let companyRepository: any;
  let membershipRepository: any;
  let authServiceClient: any;

  beforeEach(() => {
    companyRepository = { findById: jest.fn() };
    membershipRepository = {
      findByCompanyAndUser: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    authServiceClient = { provisionWorker: jest.fn() };

    useCase = new RegisterWorkerUseCase(companyRepository, membershipRepository, authServiceClient);
  });

  it('provisiona el usuario y crea la membresía en ACTIVE', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      buildMembership(MembershipRole.OWNER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(company);
    authServiceClient.provisionWorker.mockResolvedValue({
      userId: 'u-2',
      loginEmail: 'worker.u2@fake.local',
    });

    const result = await useCase.execute('u-req', 'c-1', {
      firstName: 'Juana',
      lastName: 'Pérez',
      contactEmail: 'juana@example.com',
      role: MembershipRole.WORKER,
    });

    expect(authServiceClient.provisionWorker).toHaveBeenCalledWith({
      firstName: 'Juana',
      lastName: 'Pérez',
      contactEmail: 'juana@example.com',
      companyName: 'Acme',
    });
    expect(result.membership.userId).toBe('u-2');
    expect(result.membership.companyId).toBe('c-1');
    expect(result.membership.role).toBe(MembershipRole.WORKER);
    expect(result.membership.status).toBe(MembershipStatus.ACTIVE);
    expect(result.loginEmail).toBe('worker.u2@fake.local');
    expect(membershipRepository.save).toHaveBeenCalledWith(result.membership);
  });

  it('permite registrar siendo MANAGER el solicitante', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      buildMembership(MembershipRole.MANAGER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(company);
    authServiceClient.provisionWorker.mockResolvedValue({
      userId: 'u-2',
      loginEmail: 'worker.u2@fake.local',
    });

    await expect(
      useCase.execute('u-req', 'c-1', {
        firstName: 'Juana',
        lastName: 'Pérez',
        contactEmail: 'juana@example.com',
        role: MembershipRole.WORKER,
      }),
    ).resolves.toBeDefined();
  });

  it('lanza FORBIDDEN si el solicitante no puede gestionar miembros', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(null);

    await expect(
      useCase.execute('u-req', 'c-1', {
        firstName: 'Juana',
        lastName: 'Pérez',
        contactEmail: 'juana@example.com',
        role: MembershipRole.WORKER,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });

    expect(companyRepository.findById).not.toHaveBeenCalled();
    expect(authServiceClient.provisionWorker).not.toHaveBeenCalled();
  });

  it('lanza FORBIDDEN si el solicitante es WORKER', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      buildMembership(MembershipRole.WORKER, MembershipStatus.ACTIVE),
    );

    await expect(
      useCase.execute('u-req', 'c-1', {
        firstName: 'Juana',
        lastName: 'Pérez',
        contactEmail: 'juana@example.com',
        role: MembershipRole.WORKER,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
  });

  it('lanza COMPANY_NOT_FOUND si la empresa no existe', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      buildMembership(MembershipRole.OWNER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('u-req', 'c-1', {
        firstName: 'Juana',
        lastName: 'Pérez',
        contactEmail: 'juana@example.com',
        role: MembershipRole.WORKER,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.COMPANY_NOT_FOUND });

    expect(authServiceClient.provisionWorker).not.toHaveBeenCalled();
  });

  it('lanza VALIDATION_ERROR si se intenta registrar como OWNER', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      buildMembership(MembershipRole.OWNER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(company);

    await expect(
      useCase.execute('u-req', 'c-1', {
        firstName: 'Juana',
        lastName: 'Pérez',
        contactEmail: 'juana@example.com',
        role: MembershipRole.OWNER,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_ERROR });

    expect(authServiceClient.provisionWorker).not.toHaveBeenCalled();
    expect(membershipRepository.save).not.toHaveBeenCalled();
  });

  it('propaga SERVICE_UNAVAILABLE si auth-service falla al provisionar', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      buildMembership(MembershipRole.OWNER, MembershipStatus.ACTIVE),
    );
    companyRepository.findById.mockResolvedValue(company);
    authServiceClient.provisionWorker.mockRejectedValue(
      Object.assign(new Error('down'), { code: ErrorCode.SERVICE_UNAVAILABLE }),
    );

    await expect(
      useCase.execute('u-req', 'c-1', {
        firstName: 'Juana',
        lastName: 'Pérez',
        contactEmail: 'juana@example.com',
        role: MembershipRole.WORKER,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.SERVICE_UNAVAILABLE });

    expect(membershipRepository.save).not.toHaveBeenCalled();
  });
});
