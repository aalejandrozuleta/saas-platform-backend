import { ErrorCode } from '@saas/shared';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { RemoveMemberUseCase } from './remove-member.use-case';

const build = (
  overrides: Partial<{
    id: string;
    userId: string;
    role: MembershipRole;
    status: MembershipStatus;
  }> = {},
) =>
  CompanyMembership.create({
    id: 'm-1',
    companyId: 'c-1',
    userId: 'u-1',
    role: MembershipRole.WORKER,
    status: MembershipStatus.ACTIVE,
    ...overrides,
  });

describe('RemoveMemberUseCase', () => {
  let useCase: RemoveMemberUseCase;
  let membershipRepository: any;

  beforeEach(() => {
    membershipRepository = {
      findByCompanyAndUser: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      deleteAndCountActiveOwners: jest.fn().mockResolvedValue({ activeOwners: 1 }),
    };

    useCase = new RemoveMemberUseCase(membershipRepository);
  });

  it('permite a un WORKER eliminarse a sí mismo', async () => {
    const self = build({ id: 'm-1', userId: 'u-1', role: MembershipRole.WORKER });
    membershipRepository.findByCompanyAndUser.mockResolvedValue(self);
    membershipRepository.findById.mockResolvedValue(self);

    await useCase.execute('u-1', 'c-1', 'm-1');

    expect(membershipRepository.delete).toHaveBeenCalledWith('m-1');
    expect(membershipRepository.deleteAndCountActiveOwners).not.toHaveBeenCalled();
  });

  it('un OWNER activo que se auto-elimina usa el camino transaccional', async () => {
    const self = build({ id: 'm-1', userId: 'u-1', role: MembershipRole.OWNER });
    membershipRepository.findByCompanyAndUser.mockResolvedValue(self);
    membershipRepository.findById.mockResolvedValue(self);

    await useCase.execute('u-1', 'c-1', 'm-1');

    expect(membershipRepository.deleteAndCountActiveOwners).toHaveBeenCalledWith('c-1', 'm-1');
    expect(membershipRepository.delete).not.toHaveBeenCalled();
  });

  it('propaga CONFLICT si la auto-eliminación dejaría la empresa sin OWNER activo', async () => {
    const self = build({ id: 'm-1', userId: 'u-1', role: MembershipRole.OWNER });
    membershipRepository.findByCompanyAndUser.mockResolvedValue(self);
    membershipRepository.findById.mockResolvedValue(self);
    membershipRepository.deleteAndCountActiveOwners.mockRejectedValue(
      Object.assign(new Error('membership.last_owner'), { code: ErrorCode.CONFLICT }),
    );

    await expect(useCase.execute('u-1', 'c-1', 'm-1')).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
    });
  });

  it('permite a un OWNER eliminar a otro miembro', async () => {
    const requester = build({ id: 'm-owner', userId: 'u-owner', role: MembershipRole.OWNER });
    const target = build({ id: 'm-1', userId: 'u-1', role: MembershipRole.WORKER });
    membershipRepository.findByCompanyAndUser.mockResolvedValue(requester);
    membershipRepository.findById.mockResolvedValue(target);

    await useCase.execute('u-owner', 'c-1', 'm-1');

    expect(membershipRepository.delete).toHaveBeenCalledWith('m-1');
  });

  it('permite a un MANAGER eliminar a un WORKER', async () => {
    const requester = build({ id: 'm-manager', userId: 'u-manager', role: MembershipRole.MANAGER });
    const target = build({ id: 'm-1', userId: 'u-1', role: MembershipRole.WORKER });
    membershipRepository.findByCompanyAndUser.mockResolvedValue(requester);
    membershipRepository.findById.mockResolvedValue(target);

    await useCase.execute('u-manager', 'c-1', 'm-1');

    expect(membershipRepository.delete).toHaveBeenCalledWith('m-1');
  });

  it('lanza FORBIDDEN si un WORKER intenta eliminar a otro miembro', async () => {
    const requester = build({ id: 'm-req', userId: 'u-req', role: MembershipRole.WORKER });
    const target = build({ id: 'm-1', userId: 'u-1', role: MembershipRole.WORKER });
    membershipRepository.findByCompanyAndUser.mockResolvedValue(requester);
    membershipRepository.findById.mockResolvedValue(target);

    await expect(useCase.execute('u-req', 'c-1', 'm-1')).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });

    expect(membershipRepository.delete).not.toHaveBeenCalled();
  });

  it('lanza FORBIDDEN si un MANAGER intenta eliminar a un OWNER', async () => {
    const requester = build({ id: 'm-manager', userId: 'u-manager', role: MembershipRole.MANAGER });
    const target = build({ id: 'm-owner', userId: 'u-owner', role: MembershipRole.OWNER });
    membershipRepository.findByCompanyAndUser.mockResolvedValue(requester);
    membershipRepository.findById.mockResolvedValue(target);

    await expect(useCase.execute('u-manager', 'c-1', 'm-owner')).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });

    expect(membershipRepository.delete).not.toHaveBeenCalled();
  });

  it('permite a un OWNER eliminar a otro OWNER', async () => {
    const requester = build({ id: 'm-owner-1', userId: 'u-owner-1', role: MembershipRole.OWNER });
    const target = build({ id: 'm-owner-2', userId: 'u-owner-2', role: MembershipRole.OWNER });
    membershipRepository.findByCompanyAndUser.mockResolvedValue(requester);
    membershipRepository.findById.mockResolvedValue(target);

    await useCase.execute('u-owner-1', 'c-1', 'm-owner-2');

    expect(membershipRepository.deleteAndCountActiveOwners).toHaveBeenCalledWith(
      'c-1',
      'm-owner-2',
    );
  });

  it('lanza COMPANY_NOT_FOUND si el solicitante no pertenece a la empresa', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(null);

    await expect(useCase.execute('u-outsider', 'c-1', 'm-1')).rejects.toMatchObject({
      code: ErrorCode.COMPANY_NOT_FOUND,
    });

    expect(membershipRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza MEMBERSHIP_NOT_FOUND si la membresía objetivo no existe', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      build({ id: 'm-owner', userId: 'u-owner', role: MembershipRole.OWNER }),
    );
    membershipRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('u-owner', 'c-1', 'm-1')).rejects.toMatchObject({
      code: ErrorCode.MEMBERSHIP_NOT_FOUND,
    });
  });

  it('lanza MEMBERSHIP_NOT_FOUND si la membresía objetivo es de otra empresa', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(
      build({ id: 'm-owner', userId: 'u-owner', role: MembershipRole.OWNER }),
    );
    membershipRepository.findById.mockResolvedValue(
      CompanyMembership.create({
        id: 'm-1',
        companyId: 'c-2',
        userId: 'u-1',
        role: MembershipRole.WORKER,
        status: MembershipStatus.ACTIVE,
      }),
    );

    await expect(useCase.execute('u-owner', 'c-1', 'm-1')).rejects.toMatchObject({
      code: ErrorCode.MEMBERSHIP_NOT_FOUND,
    });
  });

  it('borra directamente (sin transacción) a un OWNER que ya no está activo', async () => {
    const requester = build({ id: 'm-owner', userId: 'u-owner', role: MembershipRole.OWNER });
    const target = build({
      id: 'm-1',
      userId: 'u-1',
      role: MembershipRole.OWNER,
      status: MembershipStatus.SUSPENDED,
    });
    membershipRepository.findByCompanyAndUser.mockResolvedValue(requester);
    membershipRepository.findById.mockResolvedValue(target);

    await useCase.execute('u-owner', 'c-1', 'm-1');

    expect(membershipRepository.delete).toHaveBeenCalledWith('m-1');
    expect(membershipRepository.deleteAndCountActiveOwners).not.toHaveBeenCalled();
  });
});
