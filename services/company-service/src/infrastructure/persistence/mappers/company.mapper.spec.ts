import { Company } from '@domain/entities/company/company.entity';
import { CompanyPlan } from '@domain/enums/company-plan.enum';

import { CompanyMapper } from './company.mapper';

const date = new Date('2026-03-03T00:00:00.000Z');

const validCreateProps = {
  id: 'c-1',
  name: 'Acme',
  taxId: '900-1',
  email: 'contacto@acme.com',
  phone: '+57 3001234567',
  address: 'Calle 123',
  city: 'Bogotá',
};

describe('CompanyMapper', () => {
  it('toDomain mapea los nullables a undefined', () => {
    const company = CompanyMapper.toDomain({
      id: 'c-1',
      name: 'Acme',
      taxId: null,
      email: 'contacto@acme.com',
      phone: '+57 3001234567',
      address: 'Calle 123',
      city: 'Bogotá',
      country: 'CO',
      logoUrl: null,
      plan: 'PRO',
      subscriptionStatus: 'active',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: date,
      updatedAt: date,
    } as any);

    expect(company.id).toBe('c-1');
    expect(company.taxId).toBeUndefined();
    expect(company.logoUrl).toBeUndefined();
    expect(company.plan).toBe(CompanyPlan.PRO);
    expect(company.stripeCustomerId).toBeUndefined();
    expect(company.stripeSubscriptionId).toBeUndefined();
  });

  it('toDomain conserva los valores presentes', () => {
    const company = CompanyMapper.toDomain({
      id: 'c-1',
      name: 'Acme',
      taxId: '900-1',
      email: 'contacto@acme.com',
      phone: '+57 3001234567',
      address: 'Calle 123',
      city: 'Bogotá',
      country: 'US',
      logoUrl: 'https://storage.example.com/logos/c-1.webp',
      plan: 'BUSINESS',
      subscriptionStatus: 'past_due',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
      createdAt: date,
      updatedAt: date,
    } as any);

    expect(company.taxId).toBe('900-1');
    expect(company.email).toBe('contacto@acme.com');
    expect(company.phone).toBe('+57 3001234567');
    expect(company.address).toBe('Calle 123');
    expect(company.city).toBe('Bogotá');
    expect(company.country).toBe('US');
    expect(company.logoUrl).toBe('https://storage.example.com/logos/c-1.webp');
    expect(company.stripeCustomerId).toBe('cus_1');
    expect(company.stripeSubscriptionId).toBe('sub_1');
  });

  it('toPersistence mapea undefined a null', () => {
    const company = Company.create(validCreateProps);

    expect(CompanyMapper.toPersistence(company)).toMatchObject({
      id: 'c-1',
      name: 'Acme',
      taxId: '900-1',
      email: 'contacto@acme.com',
      phone: '+57 3001234567',
      address: 'Calle 123',
      city: 'Bogotá',
      country: 'CO',
      logoUrl: null,
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
      email: 'contacto@acme.com',
      phone: '+57 3001234567',
      address: 'Calle 123',
      city: 'Bogotá',
      country: 'CO',
      logoUrl: 'https://storage.example.com/logos/c-1.webp',
      plan: CompanyPlan.PRO,
      subscriptionStatus: 'active',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
      createdAt: date,
      updatedAt: date,
    });

    expect(CompanyMapper.toPersistence(company)).toMatchObject({
      taxId: '900-1',
      logoUrl: 'https://storage.example.com/logos/c-1.webp',
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
    expect(roundTrip.email).toBe(original.email);
    expect(roundTrip.phone).toBe(original.phone);
    expect(roundTrip.address).toBe(original.address);
    expect(roundTrip.city).toBe(original.city);
    expect(roundTrip.country).toBe(original.country);
  });
});
