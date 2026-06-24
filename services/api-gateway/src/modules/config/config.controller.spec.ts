import { ROLES_KEY } from '@saas/shared';
import { Reflector } from '@nestjs/core';

import { ConfigController } from './config.controller';

describe('ConfigController', () => {
  let controller: ConfigController;
  let mockProxy: { forward: jest.Mock };

  const makeReq = (overrides: any = {}): any => ({
    method: 'GET',
    body: {},
    headers: {},
    params: {},
    ...overrides,
  });

  const makeRes = (): any => ({
    json: jest.fn(),
  });

  beforeEach(() => {
    mockProxy = { forward: jest.fn() };
    controller = new ConfigController(mockProxy as any);
  });

  describe('maintenanceStatus', () => {
    it('llama a proxy.forward con /maintenance/status y devuelve el body', async () => {
      const body = { data: { maintenanceEnabled: false } };
      mockProxy.forward.mockResolvedValue({ body });

      const req = makeReq();
      const res = makeRes();
      await controller.maintenanceStatus(req, res);

      expect(mockProxy.forward).toHaveBeenCalledWith(req, '/maintenance/status');
      expect(res.json).toHaveBeenCalledWith(body);
    });
  });

  describe('featureFlags', () => {
    it('llama a proxy.forward con /feature-flags y devuelve el body', async () => {
      const body = { data: [{ key: 'flag-a', enabled: true }] };
      mockProxy.forward.mockResolvedValue({ body });

      const req = makeReq();
      const res = makeRes();
      await controller.featureFlags(req, res);

      expect(mockProxy.forward).toHaveBeenCalledWith(req, '/feature-flags');
      expect(res.json).toHaveBeenCalledWith(body);
    });
  });

  describe('forwardAll', () => {
    it('reenvía al path extraído del param y devuelve el body', async () => {
      const body = { data: { id: '123' } };
      mockProxy.forward.mockResolvedValue({ body });

      const req = makeReq({ params: { path: 'maintenance/mode' } });
      const res = makeRes();
      await controller.forwardAll(req, res);

      expect(mockProxy.forward).toHaveBeenCalledWith(req, '/maintenance/mode');
      expect(res.json).toHaveBeenCalledWith(body);
    });

    it('maneja paths anidados correctamente', async () => {
      const body = { success: true };
      mockProxy.forward.mockResolvedValue({ body });

      const req = makeReq({ params: { path: 'feature-flags/my-flag' } });
      const res = makeRes();
      await controller.forwardAll(req, res);

      expect(mockProxy.forward).toHaveBeenCalledWith(req, '/feature-flags/my-flag');
    });

    it('tiene metadata @Roles(SUPER_ADMIN) en el handler forwardAll', () => {
      const reflector = new Reflector();
      const roles = reflector.get<string[]>(
        ROLES_KEY,
        controller.forwardAll,
      );
      expect(roles).toEqual(['SUPER_ADMIN']);
    });
  });

  describe('metadata de seguridad', () => {
    it('maintenanceStatus es ruta pública (sin roles requeridos)', () => {
      const reflector = new Reflector();
      const roles = reflector.get<string[]>(ROLES_KEY, controller.maintenanceStatus);
      expect(roles).toBeUndefined();
    });

    it('featureFlags es ruta pública (sin roles requeridos)', () => {
      const reflector = new Reflector();
      const roles = reflector.get<string[]>(ROLES_KEY, controller.featureFlags);
      expect(roles).toBeUndefined();
    });
  });
});
