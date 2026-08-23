import { ErrorCode } from '@saas/shared';
import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { UpdateMemberUseCase } from './update-member.use-case';

const build = (
  overrides: Partial<{
    id: string;
    companyId: string;
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

const owner = build({ id: 'm-owner', userId: 'u-owner', role: MembershipRole.OWNER });
const manager = build({ id: 'm-manager', userId: 'u-manager', role: MembershipRole.MANAGER });

describe('UpdateMemberUseCase', () => {
  let useCase: UpdateMemberUseCase;
  let membershipRepository: any;

  beforeEach(() => {
    membershipRepository = {
      findByCompanyAndUser: jest.fn().mockResolvedValue(owner),
      findById: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      updateAndCountActiveOwners: jest.fn(),
    };

    useCase = new UpdateMemberUseCase(membershipRepository);
  });

  it('cambia el rol de un miembro', async () => {
    membershipRepository.findById.mockResolvedValue(build());

    const updated = await useCase.execute('u-owner', 'c-1', 'm-1', {
      role: MembershipRole.MANAGER,
    });

    expect(updated.role).toBe(MembershipRole.MANAGER);
    expect(updated.status).toBe(MembershipStatus.ACTIVE);
    expect(membershipRepository.update).toHaveBeenCalledWith(updated);
    expect(membershipRepository.updateAndCountActiveOwners).not.toHaveBeenCalled();
  });

  it('cambia el estado de un miembro', async () => {
    membershipRepository.findById.mockResolvedValue(build({ status: MembershipStatus.INVITED }));

    const updated = await useCase.execute('u-owner', 'c-1', 'm-1', {
      status: MembershipStatus.ACTIVE,
    });

    expect(updated.status).toBe(MembershipStatus.ACTIVE);
  });

  it('deja la membresía intacta si no se envían cambios', async () => {
    const target = build();

    membershipRepository.findById.mockResolvedValue(target);

    const updated = await useCase.execute('u-owner', 'c-1', 'm-1', {});

    expect(updated).toBe(target);
    expect(membershipRepository.update).toHaveBeenCalledWith(target);
  });

  it('lanza FORBIDDEN si el solicitante no puede gestionar miembros', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(build());

    await expect(
      useCase.execute('u-1', 'c-1', 'm-1', { role: MembershipRole.MANAGER }),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });

    expect(membershipRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza FORBIDDEN si un MANAGER intenta asignar el rol OWNER', async () => {
    membershipRepository.findByCompanyAndUser.mockResolvedValue(manager);

    await expect(
      useCase.execute('u-manager', 'c-1', 'm-1', { role: MembershipRole.OWNER }),
    ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });

    expect(membershipRepository.findById).not.toHaveBeenCalled();
  });

  it('permite a un OWNER asignar el rol OWNER a otro miembro', async () => {
    membershipRepository.findById.mockResolvedValue(build());

    const updated = await useCase.execute('u-owner', 'c-1', 'm-1', {
      role: MembershipRole.OWNER,
    });

    expect(updated.role).toBe(MembershipRole.OWNER);
  });

  it('lanza MEMBERSHIP_NOT_FOUND si la membresía no existe', async () => {
    membershipRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('u-owner', 'c-1', 'm-1', { role: MembershipRole.MANAGER }),
    ).rejects.toMatchObject({ code: ErrorCode.MEMBERSHIP_NOT_FOUND });
  });

  it('lanza MEMBERSHIP_NOT_FOUND si la membresía es de otra empresa', async () => {
    membershipRepository.findById.mockResolvedValue(build({ companyId: 'c-2' }));

    await expect(
      useCase.execute('u-owner', 'c-1', 'm-1', { role: MembershipRole.MANAGER }),
    ).rejects.toMatchObject({ code: ErrorCode.MEMBERSHIP_NOT_FOUND });
  });

  it('impide degradar el rol del único OWNER activo (conflicto detectado en la transacción)', async () => {
    membershipRepository.findById.mockResolvedValue(owner);
    membershipRepository.updateAndCountActiveOwners.mockRejectedValue(
      Object.assign(new Error('membership.last_owner'), { code: ErrorCode.CONFLICT }),
    );

    await expect(
      useCase.execute('u-owner', 'c-1', 'm-owner', { role: MembershipRole.MANAGER }),
    ).rejects.toMatchObject({ code: ErrorCode.CONFLICT });

    expect(membershipRepository.update).not.toHaveBeenCalled();
  });

  it('impide suspender al único OWNER activo (conflicto detectado en la transacción)', async () => {
    membershipRepository.findById.mockResolvedValue(owner);
    membershipRepository.updateAndCountActiveOwners.mockRejectedValue(
      Object.assign(new Error('membership.last_owner'), { code: ErrorCode.CONFLICT }),
    );

    await expect(
      useCase.execute('u-owner', 'c-1', 'm-owner', { status: MembershipStatus.SUSPENDED }),
    ).rejects.toMatchObject({ code: ErrorCode.CONFLICT });
  });

  it('permite degradar a un OWNER si queda otro OWNER activo', async () => {
    membershipRepository.findById.mockResolvedValue(owner);
    membershipRepository.updateAndCountActiveOwners.mockResolvedValue({
      updated: owner.changeRole(MembershipRole.MANAGER),
      activeOwners: 1,
    });

    const updated = await useCase.execute('u-owner', 'c-1', 'm-owner', {
      role: MembershipRole.MANAGER,
    });

    expect(updated.role).toBe(MembershipRole.MANAGER);
    expect(membershipRepository.updateAndCountActiveOwners).toHaveBeenCalledWith(
      'c-1',
      expect.objectContaining({ role: MembershipRole.MANAGER }),
    );
  });

  it('no usa la transacción de conteo si el objetivo no es OWNER activo', async () => {
    membershipRepository.findById.mockResolvedValue(
      build({ role: MembershipRole.OWNER, status: MembershipStatus.INVITED }),
    );

    await useCase.execute('u-owner', 'c-1', 'm-1', { role: MembershipRole.WORKER });

    expect(membershipRepository.updateAndCountActiveOwners).not.toHaveBeenCalled();
    expect(membershipRepository.update).toHaveBeenCalled();
  });

  it('no usa la transacción de conteo si el OWNER sigue siendo OWNER activo', async () => {
    membershipRepository.findById.mockResolvedValue(owner);

    await useCase.execute('u-owner', 'c-1', 'm-owner', {
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
    });

    expect(membershipRepository.updateAndCountActiveOwners).not.toHaveBeenCalled();
  });
});
