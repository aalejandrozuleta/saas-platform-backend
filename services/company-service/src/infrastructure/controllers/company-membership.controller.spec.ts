import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { CompanyMembershipController } from './company-membership.controller';

describe('CompanyMembershipController', () => {
  let controller: CompanyMembershipController;
  let inviteMemberUseCase: any;
  let listMembersUseCase: any;
  let updateMemberUseCase: any;
  let acceptInvitationUseCase: any;
  let declineInvitationUseCase: any;
  let removeMemberUseCase: any;
  let i18n: any;

  const membership = CompanyMembership.create({
    id: 'm-1',
    companyId: 'c-1',
    userId: 'u-2',
    role: MembershipRole.WORKER,
  });

  const req: any = { user: { id: 'u-1' }, get: jest.fn().mockReturnValue('es') };

  beforeEach(() => {
    inviteMemberUseCase = { execute: jest.fn().mockResolvedValue(membership) };
    listMembersUseCase = {
      execute: jest.fn().mockResolvedValue({ items: [membership], total: 1 }),
    };
    updateMemberUseCase = {
      execute: jest.fn().mockResolvedValue(membership.changeStatus(MembershipStatus.ACTIVE)),
    };
    acceptInvitationUseCase = {
      execute: jest.fn().mockResolvedValue(membership.changeStatus(MembershipStatus.ACTIVE)),
    };
    declineInvitationUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    removeMemberUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    i18n = {
      translate: jest.fn().mockReturnValue('ok'),
      resolveLanguage: jest.fn().mockReturnValue('es'),
    };

    controller = new CompanyMembershipController(
      inviteMemberUseCase,
      listMembersUseCase,
      updateMemberUseCase,
      acceptInvitationUseCase,
      declineInvitationUseCase,
      removeMemberUseCase,
      i18n,
    );
  });

  it('invite delega en el use case', async () => {
    const dto = { email: 'a@b.com', role: MembershipRole.WORKER };
    const result: any = await controller.invite('c-1', dto, req);

    expect(inviteMemberUseCase.execute).toHaveBeenCalledWith('u-1', 'c-1', dto);
    expect(result.data).toMatchObject({ id: 'm-1', userId: 'u-2' });
    expect(i18n.translate).toHaveBeenCalledWith('membership.invited_success', 'es');
  });

  it('list devuelve los miembros paginados', async () => {
    const query = { page: 1, limit: 20 } as any;
    const result: any = await controller.list('c-1', query, req);

    expect(listMembersUseCase.execute).toHaveBeenCalledWith('u-1', 'c-1', {
      page: 1,
      limit: 20,
    });
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0]).toMatchObject({ id: 'm-1', role: MembershipRole.WORKER });
    expect(result.data).toMatchObject({ page: 1, limit: 20, total: 1 });
  });

  it('update delega en el use case', async () => {
    const dto = { status: MembershipStatus.ACTIVE };
    const result: any = await controller.update('c-1', 'm-1', dto, req);

    expect(updateMemberUseCase.execute).toHaveBeenCalledWith('u-1', 'c-1', 'm-1', dto);
    expect(result.data).toMatchObject({ status: MembershipStatus.ACTIVE });
    expect(i18n.translate).toHaveBeenCalledWith('membership.updated_success', 'es');
  });

  it('accept delega en el use case y responde con el mensaje traducido', async () => {
    const result: any = await controller.accept('c-1', 'm-1', req);

    expect(acceptInvitationUseCase.execute).toHaveBeenCalledWith('u-1', 'c-1', 'm-1');
    expect(result.data).toMatchObject({ status: MembershipStatus.ACTIVE });
    expect(i18n.translate).toHaveBeenCalledWith('membership.invitation_accepted_success', 'es');
  });

  it('decline delega en el use case y responde con el mensaje traducido', async () => {
    const result: any = await controller.decline('c-1', 'm-1', req);

    expect(declineInvitationUseCase.execute).toHaveBeenCalledWith('u-1', 'c-1', 'm-1');
    expect(result.data).toEqual({});
    expect(i18n.translate).toHaveBeenCalledWith('membership.invitation_declined_success', 'es');
  });

  it('remove delega en el use case y responde con el mensaje traducido', async () => {
    const result: any = await controller.remove('c-1', 'm-1', req);

    expect(removeMemberUseCase.execute).toHaveBeenCalledWith('u-1', 'c-1', 'm-1');
    expect(result.data).toEqual({});
    expect(i18n.translate).toHaveBeenCalledWith('membership.removed_success', 'es');
  });
});
