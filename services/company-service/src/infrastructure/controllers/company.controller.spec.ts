import { Company } from '@domain/entities/company/company.entity';

import { CompanyController } from './company.controller';

describe('CompanyController', () => {
  let controller: CompanyController;
  let createCompanyUseCase: any;
  let getCompanyUseCase: any;
  let uploadCompanyLogoUseCase: any;
  let i18n: any;

  const validInput = {
    name: 'Acme',
    taxId: '900-1',
    email: 'contacto@acme.com',
    phone: '+57 3001234567',
    address: 'Calle 123',
    city: 'Bogotá',
  };

  const company = Company.create({ id: 'c-1', ...validInput });
  const req: any = { user: { id: 'u-1' }, get: jest.fn().mockReturnValue('es') };

  beforeEach(() => {
    createCompanyUseCase = { execute: jest.fn().mockResolvedValue(company) };
    getCompanyUseCase = { execute: jest.fn().mockResolvedValue(company) };
    uploadCompanyLogoUseCase = {
      execute: jest.fn().mockResolvedValue(company.updateLogo('https://storage/logos/c-1.webp')),
    };
    i18n = {
      translate: jest.fn().mockReturnValue('Empresa creada correctamente'),
      resolveLanguage: jest.fn().mockReturnValue('es'),
    };

    controller = new CompanyController(
      createCompanyUseCase,
      getCompanyUseCase,
      uploadCompanyLogoUseCase,
      i18n,
    );
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

  it('uploadLogo delega en el use case y responde con el mensaje traducido', async () => {
    const file: any = { buffer: Buffer.from('raw-upload') };

    const result: any = await controller.uploadLogo('c-1', file, req);

    expect(uploadCompanyLogoUseCase.execute).toHaveBeenCalledWith('u-1', 'c-1', {
      buffer: file.buffer,
    });
    expect(result.data.logoUrl).toBe('https://storage/logos/c-1.webp');
    expect(i18n.translate).toHaveBeenCalledWith('company.logo_updated_success', 'es');
  });

  it('resuelve el idioma en inglés cuando el header lo indica', async () => {
    const enReq: any = { user: { id: 'u-1' }, get: jest.fn().mockReturnValue('en') };
    i18n.resolveLanguage.mockReturnValue('en');

    await controller.create(validInput as any, enReq);

    expect(i18n.translate).toHaveBeenCalledWith('company.created_success', 'en');
  });
});
