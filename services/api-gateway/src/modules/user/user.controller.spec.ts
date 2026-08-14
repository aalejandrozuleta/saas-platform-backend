import { Test, type TestingModule } from '@nestjs/testing';
import { AuthProxy } from '@infrastructure/http/proxies/auth.proxy';

import { UserController } from './user.controller';

describe('UserController (api-gateway)', () => {
  let controller: UserController;
  let authProxy: jest.Mocked<AuthProxy>;

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
      controllers: [UserController],
      providers: [
        {
          provide: AuthProxy,
          useValue: { forward: jest.fn(), forwardMultipart: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(UserController);
    authProxy = module.get(AuthProxy);
  });

  afterEach(() => jest.clearAllMocks());

  it('debe reenviar POST /users/me/profile al auth-service', async () => {
    authProxy.forward.mockResolvedValue({ body: { success: true } });
    const req = makeReq();

    const result = await controller.create(req);

    expect(authProxy.forward).toHaveBeenCalledWith(req, '/users/me/profile');
    expect(result).toEqual({ success: true });
    expect(req.headers['x-correlation-id']).toBeDefined();
    expect(req.headers['accept-language']).toBe('es');
  });

  it('debe reenviar GET /users/me/profile al auth-service', async () => {
    authProxy.forward.mockResolvedValue({ body: { success: true, data: {} } });
    const req = makeReq({ method: 'GET' });

    const result = await controller.get(req);

    expect(authProxy.forward).toHaveBeenCalledWith(req, '/users/me/profile');
    expect(result).toEqual({ success: true, data: {} });
  });

  it('debe reenviar PATCH /users/me/profile al auth-service', async () => {
    authProxy.forward.mockResolvedValue({ body: { success: true } });
    const req = makeReq({ method: 'PATCH' });

    const result = await controller.update(req);

    expect(authProxy.forward).toHaveBeenCalledWith(req, '/users/me/profile');
    expect(result).toEqual({ success: true });
  });

  it('debe reenviar POST /users/me/profile/avatar como multipart', async () => {
    authProxy.forwardMultipart.mockResolvedValue({ body: { success: true } });
    const req = makeReq();
    const file: any = {
      buffer: Buffer.from('img'),
      originalname: 'avatar.png',
      mimetype: 'image/png',
    };

    const result = await controller.uploadAvatar(file, req);

    expect(authProxy.forwardMultipart).toHaveBeenCalledWith(req, '/users/me/profile/avatar', {
      buffer: file.buffer,
      originalname: 'avatar.png',
      mimetype: 'image/png',
    });
    expect(result).toEqual({ success: true });
  });

  it('no debe pisar accept-language si ya viene en la request', async () => {
    authProxy.forward.mockResolvedValue({ body: {} });
    const req = makeReq({ headers: { 'accept-language': 'en' } });

    await controller.get(req);

    expect(req.headers['accept-language']).toBe('en');
  });
});
