import { Test, type TestingModule } from '@nestjs/testing';
import { CompanyProxy } from '@infrastructure/http/proxies/company.proxy';

import { CompanyController } from './company.controller';

describe('CompanyController (api-gateway)', () => {
  let controller: CompanyController;
  let companyProxy: jest.Mocked<CompanyProxy>;

  const makeReq = (overrides: any = {}) => ({
    method: 'POST',
    body: {},
    headers: {},
    ip: '127.0.0.1',
    cookies: {},
    user: { id: 'user-1', sessionId: 'session-1' },
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyProxy,
          useValue: { forward: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(CompanyController);
    companyProxy = module.get(CompanyProxy);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe reenviar POST /companies al company-service', async () => {
    companyProxy.forward.mockResolvedValue({ body: { success: true } });
    const req = makeReq();

    const result = await controller.create(req);

    expect(companyProxy.forward).toHaveBeenCalledWith(req, '/companies');
    expect(result).toEqual({ success: true });
    expect(req.headers['x-correlation-id']).toBeDefined();
    expect(req.headers['accept-language']).toBe('es');
  });

  it('debe reenviar GET /companies/:id al company-service', async () => {
    companyProxy.forward.mockResolvedValue({ body: { success: true, data: {} } });
    const req = makeReq({ method: 'GET' });

    const result = await controller.get(req, 'company-1');

    expect(companyProxy.forward).toHaveBeenCalledWith(req, '/companies/company-1');
    expect(result).toEqual({ success: true, data: {} });
  });

  it('debe reenviar POST /companies/:id/members al company-service', async () => {
    companyProxy.forward.mockResolvedValue({ body: { success: true } });
    const req = makeReq();

    const result = await controller.inviteMember(req, 'company-1');

    expect(companyProxy.forward).toHaveBeenCalledWith(req, '/companies/company-1/members');
    expect(result).toEqual({ success: true });
  });

  it('debe reenviar GET /companies/:id/members al company-service', async () => {
    companyProxy.forward.mockResolvedValue({ body: { success: true, data: [] } });
    const req = makeReq({ method: 'GET' });

    const result = await controller.listMembers(req, 'company-1');

    expect(companyProxy.forward).toHaveBeenCalledWith(req, '/companies/company-1/members');
    expect(result).toEqual({ success: true, data: [] });
  });

  it('debe reenviar PATCH /companies/:id/members/:membershipId al company-service', async () => {
    companyProxy.forward.mockResolvedValue({ body: { success: true } });
    const req = makeReq({ method: 'PATCH' });

    const result = await controller.updateMember(req, 'company-1', 'membership-1');

    expect(companyProxy.forward).toHaveBeenCalledWith(
      req,
      '/companies/company-1/members/membership-1',
    );
    expect(result).toEqual({ success: true });
  });

  it('no debe pisar accept-language si ya viene en la request', async () => {
    companyProxy.forward.mockResolvedValue({ body: {} });
    const req = makeReq({ method: 'GET', headers: { 'accept-language': 'en' } });

    await controller.get(req, 'company-1');

    expect(req.headers['accept-language']).toBe('en');
  });
});
