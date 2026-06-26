import { Test, type TestingModule } from '@nestjs/testing';
import { AuthProxy } from '@infrastructure/http/proxies/auth.proxy';

import { AuthController } from './auth.controller';

describe('AuthController (api-gateway)', () => {
  let controller: AuthController;
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

  const makeRes = () => ({
    setHeader: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthProxy,
          useValue: { forward: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authProxy = module.get(AuthProxy);
  });

  afterEach(() => jest.clearAllMocks());

  // ──────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────

  const mockForward = (body: unknown, cookies?: string[]) => {
    authProxy.forward.mockResolvedValue({ body, cookies });
  };

  // ──────────────────────────────────────────────────
  // Register
  // ──────────────────────────────────────────────────

  it('debe reenviar POST /register al auth-service', async () => {
    mockForward({ success: true });
    const req = makeReq();
    const result = await controller.register(req);

    expect(authProxy.forward).toHaveBeenCalledWith(req, '/register');
    expect(result).toEqual({ success: true });
    expect(req.headers['accept-language']).toBe('es');
  });

  // ──────────────────────────────────────────────────
  // Login
  // ──────────────────────────────────────────────────

  it('debe reenviar POST /login y propagar cookies', async () => {
    mockForward({ data: { message: 'ok' } }, ['accessToken=abc']);
    const req = makeReq();
    const res = makeRes();

    const result = await controller.login(req, res as any);

    expect(authProxy.forward).toHaveBeenCalledWith(req, '/login');
    expect(res.setHeader).toHaveBeenCalledWith('set-cookie', ['accessToken=abc']);
    expect(result).toEqual({ data: { message: 'ok' } });
  });

  it('no debe llamar setHeader si el login no retorna cookies', async () => {
    mockForward({ data: {} });
    const req = makeReq();
    const res = makeRes();

    await controller.login(req, res as any);

    expect(res.setHeader).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────
  // Refresh
  // ──────────────────────────────────────────────────

  it('debe reenviar POST /refresh y propagar cookies', async () => {
    mockForward({ data: {} }, ['refreshToken=xyz']);
    const req = makeReq();
    const res = makeRes();

    await controller.refresh(req, res as any);

    expect(authProxy.forward).toHaveBeenCalledWith(req, '/refresh');
    expect(res.setHeader).toHaveBeenCalledWith('set-cookie', ['refreshToken=xyz']);
  });

  it('no debe llamar setHeader en refresh sin cookies', async () => {
    mockForward({ data: {} });
    const req = makeReq();
    const res = makeRes();

    await controller.refresh(req, res as any);

    expect(res.setHeader).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────
  // Change Password
  // ──────────────────────────────────────────────────

  it('debe inyectar x-user-id y reenviar a /change-password', async () => {
    mockForward({ success: true });
    const req = makeReq();

    await controller.changePassword(req);

    expect(req.headers['x-user-id']).toBe('user-1');
    expect(authProxy.forward).toHaveBeenCalledWith(req, '/change-password');
  });

  // ──────────────────────────────────────────────────
  // Logout
  // ──────────────────────────────────────────────────

  it('debe inyectar x-user-id + x-session-id y reenviar a /logout', async () => {
    mockForward({}, ['accessToken=; Max-Age=0']);
    const req = makeReq();
    const res = makeRes();

    await controller.logout(req, res as any);

    expect(req.headers['x-user-id']).toBe('user-1');
    expect(req.headers['x-session-id']).toBe('session-1');
    expect(authProxy.forward).toHaveBeenCalledWith(req, '/logout');
    expect(res.setHeader).toHaveBeenCalled();
  });

  it('no debe llamar setHeader en logout sin cookies', async () => {
    mockForward({});
    const req = makeReq();
    const res = makeRes();

    await controller.logout(req, res as any);

    expect(res.setHeader).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────
  // Logout All
  // ──────────────────────────────────────────────────

  it('debe inyectar x-user-id y reenviar a /logout-all', async () => {
    mockForward({ data: { revokedCount: 3 } }, ['accessToken=; Max-Age=0']);
    const req = makeReq();
    const res = makeRes();

    await controller.logoutAll(req, res as any);

    expect(req.headers['x-user-id']).toBe('user-1');
    expect(authProxy.forward).toHaveBeenCalledWith(req, '/logout-all');
    expect(res.setHeader).toHaveBeenCalled();
  });

  it('no debe llamar setHeader en logout-all sin cookies', async () => {
    mockForward({ data: { revokedCount: 0 } });
    const req = makeReq();
    const res = makeRes();

    await controller.logoutAll(req, res as any);

    expect(res.setHeader).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────
  // 2FA
  // ──────────────────────────────────────────────────

  it('debe inyectar x-user-id y reenviar a /2fa/enable', async () => {
    mockForward({ data: { secret: 'JBSWY3D', qrCode: 'data:...' } });
    const req = makeReq();

    await controller.enable2fa(req);

    expect(req.headers['x-user-id']).toBe('user-1');
    expect(authProxy.forward).toHaveBeenCalledWith(req, '/2fa/enable');
  });

  it('debe inyectar x-user-id y reenviar a /2fa/verify', async () => {
    mockForward({ data: { recoveryCodes: ['AAAA-BBBB'] } });
    const req = makeReq();

    await controller.verify2fa(req);

    expect(req.headers['x-user-id']).toBe('user-1');
    expect(authProxy.forward).toHaveBeenCalledWith(req, '/2fa/verify');
  });

  it('debe inyectar x-user-id y reenviar a /2fa/disable', async () => {
    mockForward({ data: {} });
    const req = makeReq();

    await controller.disable2fa(req);

    expect(req.headers['x-user-id']).toBe('user-1');
    expect(authProxy.forward).toHaveBeenCalledWith(req, '/2fa/disable');
  });

  // ──────────────────────────────────────────────────
  // prepareRequest (implícito)
  // ──────────────────────────────────────────────────

  it('debe agregar x-correlation-id si no está presente', async () => {
    mockForward({ ok: true });
    const req = makeReq({ headers: {} });

    await controller.register(req);

    expect(typeof req.headers['x-correlation-id']).toBe('string');
    expect(req.headers['x-correlation-id']).toHaveLength(36); // UUID
  });

  it('no debe sobreescribir x-correlation-id existente', async () => {
    mockForward({ ok: true });
    const req = makeReq({ headers: { 'x-correlation-id': 'existing-id' } });

    await controller.register(req);

    expect(req.headers['x-correlation-id']).toBe('existing-id');
  });

  it('debe agregar accept-language por defecto si no está presente', async () => {
    mockForward({ ok: true });
    const req = makeReq({ headers: {} });

    await controller.register(req);

    expect(req.headers['accept-language']).toBe('es');
  });
});
