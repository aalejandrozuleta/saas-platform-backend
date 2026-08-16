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

describe('UpdateMemberUseCase', () => {
  let useCase: UpdateMemberUseCase;
  let membershipRepository: any;

  beforeEach(() => {
    membershipRepository = {
      findByCompanyAndUser: jest.fn().mockResolvedValue(owner),
      findById: jest.fn(),
      findByCompanyId: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
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

  it('impide degradar el rol del único OWNER activo', async () => {
    membershipRepository.findById.mockResolvedValue(owner);
    membershipRepository.findByCompanyId.mockResolvedValue([owner, build()]);

    await expect(
      useCase.execute('u-owner', 'c-1', 'm-owner', { role: MembershipRole.MANAGER }),
    ).rejects.toMatchObject({ code: ErrorCode.CONFLICT });

    expect(membershipRepository.update).not.toHaveBeenCalled();
  });

  it('impide suspender al único OWNER activo', async () => {
    membershipRepository.findById.mockResolvedValue(owner);
    membershipRepository.findByCompanyId.mockResolvedValue([owner]);

    await expect(
      useCase.execute('u-owner', 'c-1', 'm-owner', { status: MembershipStatus.SUSPENDED }),
    ).rejects.toMatchObject({ code: ErrorCode.CONFLICT });
  });

  it('permite degradar a un OWNER si queda otro OWNER activo', async () => {
    const secondOwner = build({ id: 'm-owner-2', userId: 'u-owner-2', role: MembershipRole.OWNER });

    membershipRepository.findById.mockResolvedValue(owner);
    membershipRepository.findByCompanyId.mockResolvedValue([owner, secondOwner]);

    const updated = await useCase.execute('u-owner', 'c-1', 'm-owner', {
      role: MembershipRole.MANAGER,
    });

    expect(updated.role).toBe(MembershipRole.MANAGER);
  });

  it('no consulta el conteo de OWNERs si el objetivo no es OWNER activo', async () => {
    membershipRepository.findById.mockResolvedValue(
      build({ role: MembershipRole.OWNER, status: MembershipStatus.INVITED }),
    );

    await useCase.execute('u-owner', 'c-1', 'm-1', { role: MembershipRole.WORKER });

    expect(membershipRepository.findByCompanyId).not.toHaveBeenCalled();
  });

  it('no consulta el conteo de OWNERs si el OWNER sigue siendo OWNER activo', async () => {
    membershipRepository.findById.mockResolvedValue(owner);

    await useCase.execute('u-owner', 'c-1', 'm-owner', {
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
    });

    expect(membershipRepository.findByCompanyId).not.toHaveBeenCalled();
  });
});
