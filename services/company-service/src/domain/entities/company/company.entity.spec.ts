import { CompanyPlan } from '@domain/enums/company-plan.enum';

import { Company, DEFAULT_SUBSCRIPTION_STATUS } from './company.entity';

const validProps = {
  id: 'c-1',
  name: '  Acme S.A.S.  ',
  taxId: '900-1',
  email: 'contacto@acme.com',
  phone: '+57 3001234567',
  address: 'Calle 123',
  city: 'Bogotá',
};

describe('Company entity', () => {
  describe('create', () => {
    it('crea la empresa en plan STARTER y suscripción activa', () => {
      const company = Company.create(validProps);

      expect(company.id).toBe('c-1');
      expect(company.name).toBe('Acme S.A.S.');
      expect(company.taxId).toBe('900-1');
      expect(company.email).toBe('contacto@acme.com');
      expect(company.phone).toBe('+57 3001234567');
      expect(company.address).toBe('Calle 123');
      expect(company.city).toBe('Bogotá');
      expect(company.country).toBe('CO');
      expect(company.logoUrl).toBeUndefined();
      expect(company.plan).toBe(CompanyPlan.STARTER);
      expect(company.subscriptionStatus).toBe(DEFAULT_SUBSCRIPTION_STATUS);
      expect(company.stripeCustomerId).toBeUndefined();
      expect(company.stripeSubscriptionId).toBeUndefined();
      expect(company.createdAt).toBeInstanceOf(Date);
      expect(company.updatedAt).toBeInstanceOf(Date);
    });

    it('permite crear sin taxId', () => {
      const company = Company.create({ ...validProps, taxId: undefined });

      expect(company.taxId).toBeUndefined();
    });

    it('usa el country explícito si se provee', () => {
      const company = Company.create({ ...validProps, country: 'US' });

      expect(company.country).toBe('US');
    });

    it('usa CO como default si country llega vacío', () => {
      const company = Company.create({ ...validProps, country: '   ' });

      expect(company.country).toBe('CO');
    });

    it('lanza COMPANY_NAME_REQUIRED si el nombre está vacío', () => {
      expect(() => Company.create({ ...validProps, name: '   ' })).toThrow('COMPANY_NAME_REQUIRED');
    });

    it('lanza COMPANY_EMAIL_REQUIRED si el email está vacío', () => {
      expect(() => Company.create({ ...validProps, email: '   ' })).toThrow(
        'COMPANY_EMAIL_REQUIRED',
      );
    });

    it('lanza COMPANY_PHONE_REQUIRED si el teléfono está vacío', () => {
      expect(() => Company.create({ ...validProps, phone: '   ' })).toThrow(
        'COMPANY_PHONE_REQUIRED',
      );
    });

    it('lanza COMPANY_ADDRESS_REQUIRED si la dirección está vacía', () => {
      expect(() => Company.create({ ...validProps, address: '   ' })).toThrow(
        'COMPANY_ADDRESS_REQUIRED',
      );
    });

    it('lanza COMPANY_CITY_REQUIRED si la ciudad está vacía', () => {
      expect(() => Company.create({ ...validProps, city: '   ' })).toThrow('COMPANY_CITY_REQUIRED');
    });

    it('lanza COMPANY_EMAIL_REQUIRED si el email está vacío', () => {
      expect(() => Company.create({ ...validProps, email: '   ' })).toThrow(
        'COMPANY_EMAIL_REQUIRED',
      );
    });

    it('lanza COMPANY_PHONE_REQUIRED si el teléfono está vacío', () => {
      expect(() => Company.create({ ...validProps, phone: '   ' })).toThrow(
        'COMPANY_PHONE_REQUIRED',
      );
    });

    it('lanza COMPANY_ADDRESS_REQUIRED si la dirección está vacía', () => {
      expect(() => Company.create({ ...validProps, address: '   ' })).toThrow(
        'COMPANY_ADDRESS_REQUIRED',
      );
    });

    it('lanza COMPANY_CITY_REQUIRED si la ciudad está vacía', () => {
      expect(() => Company.create({ ...validProps, city: '   ' })).toThrow('COMPANY_CITY_REQUIRED');
    });
  });

  describe('fromPersistence', () => {
    it('reconstruye la entidad sin aplicar reglas de negocio', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');

      const company = Company.fromPersistence({
        id: 'c-1',
        name: '',
        taxId: undefined,
        email: 'contacto@acme.com',
        phone: '+57 3001234567',
        address: 'Calle 123',
        city: 'Bogotá',
        country: 'CO',
        logoUrl: 'https://storage.example.com/logos/c-1.webp',
        plan: CompanyPlan.BUSINESS,
        subscriptionStatus: 'past_due',
        stripeCustomerId: 'cus_1',
        stripeSubscriptionId: 'sub_1',
        createdAt,
        updatedAt: createdAt,
      });

      expect(company.name).toBe('');
      expect(company.logoUrl).toBe('https://storage.example.com/logos/c-1.webp');
      expect(company.plan).toBe(CompanyPlan.BUSINESS);
      expect(company.subscriptionStatus).toBe('past_due');
      expect(company.stripeCustomerId).toBe('cus_1');
      expect(company.stripeSubscriptionId).toBe('sub_1');
      expect(company.createdAt).toBe(createdAt);
      expect(company.updatedAt).toBe(createdAt);
    });
  });

  describe('rename', () => {
    it('devuelve una nueva instancia con el nombre normalizado', () => {
      const company = Company.create(validProps);
      const renamed = company.rename('  Nueva Acme ');

      expect(renamed).not.toBe(company);
      expect(renamed.name).toBe('Nueva Acme');
      expect(company.name).toBe('Acme S.A.S.');
    });

    it('lanza COMPANY_NAME_REQUIRED si el nombre nuevo está vacío', () => {
      const company = Company.create(validProps);

      expect(() => company.rename('  ')).toThrow('COMPANY_NAME_REQUIRED');
    });
  });

  describe('updateLogo', () => {
    it('devuelve una nueva instancia con logoUrl actualizado', () => {
      const company = Company.create(validProps);
      const updated = company.updateLogo('https://storage.example.com/logos/c-1.webp');

      expect(updated).not.toBe(company);
      expect(updated.logoUrl).toBe('https://storage.example.com/logos/c-1.webp');
      expect(company.logoUrl).toBeUndefined();
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(company.updatedAt.getTime());
    });
  });
});
