import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { CompanyMembershipController } from './company-membership.controller';

describe('CompanyMembershipController', () => {
  let controller: CompanyMembershipController;
  let inviteMemberUseCase: any;
  let listMembersUseCase: any;
  let updateMemberUseCase: any;
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
    listMembersUseCase = { execute: jest.fn().mockResolvedValue([membership]) };
    updateMemberUseCase = {
      execute: jest.fn().mockResolvedValue(membership.changeStatus(MembershipStatus.ACTIVE)),
    };
    i18n = {
      translate: jest.fn().mockReturnValue('ok'),
      resolveLanguage: jest.fn().mockReturnValue('es'),
    };

    controller = new CompanyMembershipController(
      inviteMemberUseCase,
      listMembersUseCase,
      updateMemberUseCase,
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

  it('list devuelve todos los miembros mapeados', async () => {
    const result: any = await controller.list('c-1', req);

    expect(listMembersUseCase.execute).toHaveBeenCalledWith('u-1', 'c-1');
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({ id: 'm-1', role: MembershipRole.WORKER });
  });

  it('update delega en el use case', async () => {
    const dto = { status: MembershipStatus.ACTIVE };
    const result: any = await controller.update('c-1', 'm-1', dto, req);

    expect(updateMemberUseCase.execute).toHaveBeenCalledWith('u-1', 'c-1', 'm-1', dto);
    expect(result.data).toMatchObject({ status: MembershipStatus.ACTIVE });
    expect(i18n.translate).toHaveBeenCalledWith('membership.updated_success', 'es');
  });
});
