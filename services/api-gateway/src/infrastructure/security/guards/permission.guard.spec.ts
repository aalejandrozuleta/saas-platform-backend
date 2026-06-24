import { ForbiddenException } from '@nestjs/common';
import { type Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '@saas/shared';

import { PermissionGuard } from './permission.guard';

const makeContext = (opts: { permission?: string | undefined; userPermissions?: string[] } = {}) => {
  const req: any = {
    user: { id: 'u1', sessionId: 's1', role: 'EMPLOYEE', permissions: opts.userPermissions ?? [] },
  };

  const ctx: any = {
    getHandler: jest.fn(),
    getClass:   jest.fn(),
    switchToHttp: () => ({ getRequest: () => req }),
  };

  return { ctx, req };
};

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new PermissionGuard(reflector);
  });

  it('debe permitir acceso si no hay permiso requerido', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const { ctx } = makeContext();
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('debe permitir acceso si el usuario tiene el permiso requerido', () => {
    reflector.getAllAndOverride.mockReturnValue('invoice:create');
    const { ctx } = makeContext({ userPermissions: ['invoice:create', 'invoice:list'] });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('debe lanzar ForbiddenException si el usuario no tiene el permiso', () => {
    reflector.getAllAndOverride.mockReturnValue('finance:read');
    const { ctx } = makeContext({ userPermissions: ['invoice:create'] });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('debe usar la clave PERMISSION_KEY al leer metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const { ctx } = makeContext();
    guard.canActivate(ctx);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      PERMISSION_KEY,
      expect.any(Array),
    );
  });

  it('debe lanzar ForbiddenException si req.user no tiene array permissions', () => {
    reflector.getAllAndOverride.mockReturnValue('invoice:create');
    const req: any = { user: { id: 'u1' } };
    const ctx: any = {
      getHandler: jest.fn(),
      getClass:   jest.fn(),
      switchToHttp: () => ({ getRequest: () => req }),
    };
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
