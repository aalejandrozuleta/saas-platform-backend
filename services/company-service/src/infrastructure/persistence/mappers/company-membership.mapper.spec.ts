import { CompanyMembership } from '@domain/entities/company-membership/company-membership.entity';
import { MembershipRole } from '@domain/enums/membership-role.enum';
import { MembershipStatus } from '@domain/enums/membership-status.enum';

import { CompanyMembershipMapper } from './company-membership.mapper';

const date = new Date('2026-03-03T00:00:00.000Z');

describe('CompanyMembershipMapper', () => {
  it('toDomain mapea rol y estado', () => {
    const membership = CompanyMembershipMapper.toDomain({
      id: 'm-1',
      companyId: 'c-1',
      userId: 'u-1',
      role: 'MANAGER',
      status: 'SUSPENDED',
      createdAt: date,
      updatedAt: date,
    } as any);

    expect(membership.id).toBe('m-1');
    expect(membership.companyId).toBe('c-1');
    expect(membership.userId).toBe('u-1');
    expect(membership.role).toBe(MembershipRole.MANAGER);
    expect(membership.status).toBe(MembershipStatus.SUSPENDED);
    expect(membership.createdAt).toBe(date);
  });

  it('toPersistence devuelve la fila plana', () => {
    const membership = CompanyMembership.create({
      id: 'm-1',
      companyId: 'c-1',
      userId: 'u-1',
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
    });

    expect(CompanyMembershipMapper.toPersistence(membership)).toMatchObject({
      id: 'm-1',
      companyId: 'c-1',
      userId: 'u-1',
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
    });
  });

  it('ida y vuelta preserva la entidad', () => {
    const original = CompanyMembership.create({
      id: 'm-1',
      companyId: 'c-1',
      userId: 'u-1',
      role: MembershipRole.WORKER,
    });

    const roundTrip = CompanyMembershipMapper.toDomain(
      CompanyMembershipMapper.toPersistence(original) as any,
    );

    expect(roundTrip.role).toBe(original.role);
    expect(roundTrip.status).toBe(original.status);
  });
});
