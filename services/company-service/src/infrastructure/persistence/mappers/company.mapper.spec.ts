import { Company } from '@domain/entities/company/company.entity';
import { CompanyPlan } from '@domain/enums/company-plan.enum';

import { CompanyMapper } from './company.mapper';

const date = new Date('2026-03-03T00:00:00.000Z');

const validCreateProps = {
  id: 'c-1',
  name: 'Acme',
  taxId: '900-1',
};

describe('CompanyMapper', () => {
  it('toDomain mapea los nullables a undefined', () => {
    const company = CompanyMapper.toDomain({
      id: 'c-1',
      name: 'Acme',
      taxId: null,
      plan: 'PRO',
      subscriptionStatus: 'active',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: date,
      updatedAt: date,
    } as any);

    expect(company.id).toBe('c-1');
    expect(company.taxId).toBeUndefined();
    expect(company.plan).toBe(CompanyPlan.PRO);
    expect(company.stripeCustomerId).toBeUndefined();
    expect(company.stripeSubscriptionId).toBeUndefined();
  });

  it('toDomain conserva los valores presentes', () => {
    const company = CompanyMapper.toDomain({
      id: 'c-1',
      name: 'Acme',
      taxId: '900-1',
      plan: 'BUSINESS',
      subscriptionStatus: 'past_due',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
      createdAt: date,
      updatedAt: date,
    } as any);

    expect(company.taxId).toBe('900-1');
    expect(company.stripeCustomerId).toBe('cus_1');
    expect(company.stripeSubscriptionId).toBe('sub_1');
  });

  it('toPersistence mapea undefined a null', () => {
    const company = Company.create(validCreateProps);

    expect(CompanyMapper.toPersistence(company)).toMatchObject({
      id: 'c-1',
      name: 'Acme',
      taxId: '900-1',
      plan: CompanyPlan.STARTER,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    });
  });

  it('toPersistence conserva los valores presentes', () => {
    const company = Company.fromPersistence({
      id: 'c-1',
      name: 'Acme',
      taxId: '900-1',
      plan: CompanyPlan.PRO,
      subscriptionStatus: 'active',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
      createdAt: date,
      updatedAt: date,
    });

    expect(CompanyMapper.toPersistence(company)).toMatchObject({
      taxId: '900-1',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
    });
  });

  it('ida y vuelta preserva la entidad', () => {
    const original = Company.create(validCreateProps);
    const roundTrip = CompanyMapper.toDomain(CompanyMapper.toPersistence(original) as any);

    expect(roundTrip.id).toBe(original.id);
    expect(roundTrip.name).toBe(original.name);
    expect(roundTrip.taxId).toBe(original.taxId);
  });
});
