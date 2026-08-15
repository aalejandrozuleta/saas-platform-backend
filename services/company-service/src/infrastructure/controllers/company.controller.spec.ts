import { Company } from '@domain/entities/company/company.entity';

import { CompanyController } from './company.controller';

describe('CompanyController', () => {
  let controller: CompanyController;
  let createCompanyUseCase: any;
  let getCompanyUseCase: any;
  let i18n: any;

  const validInput = {
    name: 'Acme',
    taxId: '900-1',
  };

  const company = Company.create({ id: 'c-1', ...validInput });
  const req: any = { user: { id: 'u-1' }, get: jest.fn().mockReturnValue('es') };

  beforeEach(() => {
    createCompanyUseCase = { execute: jest.fn().mockResolvedValue(company) };
    getCompanyUseCase = { execute: jest.fn().mockResolvedValue(company) };
    i18n = {
      translate: jest.fn().mockReturnValue('Empresa creada correctamente'),
      resolveLanguage: jest.fn().mockReturnValue('es'),
    };

    controller = new CompanyController(createCompanyUseCase, getCompanyUseCase, i18n);
  });

  it('create delega en el use case y responde con el mensaje traducido', async () => {
    const result: any = await controller.create(validInput as any, req);

    expect(createCompanyUseCase.execute).toHaveBeenCalledWith('u-1', validInput);
    expect(result.data).toMatchObject({ id: 'c-1', name: 'Acme', taxId: '900-1' });
    expect(i18n.translate).toHaveBeenCalledWith('company.created_success', 'es');
  });

  it('get delega en el use case', async () => {
    const result: any = await controller.get('c-1', req);

    expect(getCompanyUseCase.execute).toHaveBeenCalledWith('u-1', 'c-1');
    expect(result.data).toMatchObject({ id: 'c-1' });
  });

  it('resuelve el idioma en inglés cuando el header lo indica', async () => {
    const enReq: any = { user: { id: 'u-1' }, get: jest.fn().mockReturnValue('en') };
    i18n.resolveLanguage.mockReturnValue('en');

    await controller.create(validInput as any, enReq);

    expect(i18n.translate).toHaveBeenCalledWith('company.created_success', 'en');
  });
});
