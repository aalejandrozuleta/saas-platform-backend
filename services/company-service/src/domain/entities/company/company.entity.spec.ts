import { CompanyPlan } from '@domain/enums/company-plan.enum';

import { Company, DEFAULT_SUBSCRIPTION_STATUS } from './company.entity';

const validProps = {
  id: 'c-1',
  name: '  Acme S.A.S.  ',
  taxId: '900-1',
};

describe('Company entity', () => {
  describe('create', () => {
    it('crea la empresa en plan STARTER y suscripción activa', () => {
      const company = Company.create(validProps);

      expect(company.id).toBe('c-1');
      expect(company.name).toBe('Acme S.A.S.');
      expect(company.taxId).toBe('900-1');
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

    it('lanza COMPANY_NAME_REQUIRED si el nombre está vacío', () => {
      expect(() => Company.create({ ...validProps, name: '   ' })).toThrow('COMPANY_NAME_REQUIRED');
    });
  });

  describe('fromPersistence', () => {
    it('reconstruye la entidad sin aplicar reglas de negocio', () => {
      const createdAt = new Date('2026-01-01T00:00:00.000Z');

      const company = Company.fromPersistence({
        id: 'c-1',
        name: '',
        taxId: undefined,
        plan: CompanyPlan.BUSINESS,
        subscriptionStatus: 'past_due',
        stripeCustomerId: 'cus_1',
        stripeSubscriptionId: 'sub_1',
        createdAt,
        updatedAt: createdAt,
      });

      expect(company.name).toBe('');
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
});
