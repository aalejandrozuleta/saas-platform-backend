import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { CompanyMembership } from './company-membership.entity';

const base = {
  id: 'm-1',
  companyId: 'c-1',
  userId: 'u-1',
  role: MembershipRole.WORKER,
};

describe('CompanyMembership entity', () => {
  describe('create', () => {
    it('usa INVITED como estado por defecto', () => {
      const membership = CompanyMembership.create(base);

      expect(membership.id).toBe('m-1');
      expect(membership.companyId).toBe('c-1');
      expect(membership.userId).toBe('u-1');
      expect(membership.role).toBe(MembershipRole.WORKER);
      expect(membership.status).toBe(MembershipStatus.INVITED);
      expect(membership.createdAt).toBeInstanceOf(Date);
      expect(membership.updatedAt).toBeInstanceOf(Date);
    });

    it('respeta el estado explícito', () => {
      const membership = CompanyMembership.create({
        ...base,
        role: MembershipRole.OWNER,
        status: MembershipStatus.ACTIVE,
      });

      expect(membership.status).toBe(MembershipStatus.ACTIVE);
    });

    it('lanza si falta companyId', () => {
      expect(() => CompanyMembership.create({ ...base, companyId: ' ' })).toThrow(
        'MEMBERSHIP_COMPANY_ID_REQUIRED',
      );
    });

    it('lanza si falta userId', () => {
      expect(() => CompanyMembership.create({ ...base, userId: ' ' })).toThrow(
        'MEMBERSHIP_USER_ID_REQUIRED',
      );
    });
  });

  describe('fromPersistence', () => {
    it('reconstruye la entidad tal cual', () => {
      const date = new Date('2026-02-02T00:00:00.000Z');

      const membership = CompanyMembership.fromPersistence({
        ...base,
        status: MembershipStatus.SUSPENDED,
        createdAt: date,
        updatedAt: date,
      });

      expect(membership.status).toBe(MembershipStatus.SUSPENDED);
      expect(membership.createdAt).toBe(date);
      expect(membership.updatedAt).toBe(date);
    });
  });

  describe('reglas de dominio', () => {
    const build = (role: MembershipRole, status: MembershipStatus) =>
      CompanyMembership.create({ ...base, role, status });

    it.each([
      [MembershipRole.OWNER, MembershipStatus.ACTIVE, true],
      [MembershipRole.MANAGER, MembershipStatus.ACTIVE, true],
      [MembershipRole.WORKER, MembershipStatus.ACTIVE, false],
      [MembershipRole.OWNER, MembershipStatus.INVITED, false],
      [MembershipRole.MANAGER, MembershipStatus.SUSPENDED, false],
    ])('canManageMembers(%s, %s) === %s', (role, status, expected) => {
      expect(build(role, status).canManageMembers()).toBe(expected);
    });

    it('isActive refleja el estado ACTIVE', () => {
      expect(build(MembershipRole.WORKER, MembershipStatus.ACTIVE).isActive()).toBe(true);
      expect(build(MembershipRole.WORKER, MembershipStatus.INVITED).isActive()).toBe(false);
    });

    it('isOwner refleja el rol OWNER', () => {
      expect(build(MembershipRole.OWNER, MembershipStatus.ACTIVE).isOwner()).toBe(true);
      expect(build(MembershipRole.WORKER, MembershipStatus.ACTIVE).isOwner()).toBe(false);
    });

    it('changeRole devuelve una nueva instancia', () => {
      const membership = build(MembershipRole.WORKER, MembershipStatus.ACTIVE);
      const updated = membership.changeRole(MembershipRole.MANAGER);

      expect(updated).not.toBe(membership);
      expect(updated.role).toBe(MembershipRole.MANAGER);
      expect(membership.role).toBe(MembershipRole.WORKER);
    });

    it('changeStatus devuelve una nueva instancia', () => {
      const membership = build(MembershipRole.WORKER, MembershipStatus.INVITED);
      const updated = membership.changeStatus(MembershipStatus.ACTIVE);

      expect(updated).not.toBe(membership);
      expect(updated.status).toBe(MembershipStatus.ACTIVE);
      expect(membership.status).toBe(MembershipStatus.INVITED);
    });
  });
});
