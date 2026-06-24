import { ForbiddenException } from '@nestjs/common';
import { type Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard';

const makeContext = (overrides: {
  requiredRoles?: string[] | undefined;
  userRole?: string | undefined;
} = {}) => {
  const req: any = {
    user: overrides.userRole !== undefined ? { role: overrides.userRole } : undefined,
  };

  const reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>> = {
    getAllAndOverride: jest.fn().mockReturnValue(overrides.requiredRoles),
  };

  const ctx: any = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => req }),
  };

  return { ctx, reflector, req };
};

describe('RolesGuard', () => {
  describe('cuando el endpoint no tiene @Roles()', () => {
    it('permite el acceso sin importar el rol del usuario', () => {
      const { ctx, reflector } = makeContext({ requiredRoles: undefined, userRole: 'USER' });
      const guard = new RolesGuard(reflector as any);
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('permite el acceso cuando la lista de roles requeridos está vacía', () => {
      const { ctx, reflector } = makeContext({ requiredRoles: [], userRole: 'USER' });
      const guard = new RolesGuard(reflector as any);
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('cuando el endpoint tiene @Roles()', () => {
    it('permite el acceso si el usuario tiene el rol requerido', () => {
      const { ctx, reflector } = makeContext({
        requiredRoles: ['SUPER_ADMIN'],
        userRole: 'SUPER_ADMIN',
      });
      const guard = new RolesGuard(reflector as any);
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('permite el acceso si el usuario tiene uno de varios roles permitidos', () => {
      const { ctx, reflector } = makeContext({
        requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
        userRole: 'ADMIN',
      });
      const guard = new RolesGuard(reflector as any);
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('lanza ForbiddenException si el usuario tiene rol insuficiente', () => {
      const { ctx, reflector } = makeContext({
        requiredRoles: ['SUPER_ADMIN'],
        userRole: 'USER',
      });
      const guard = new RolesGuard(reflector as any);
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('lanza ForbiddenException si req.user es undefined', () => {
      const { ctx, reflector } = makeContext({
        requiredRoles: ['SUPER_ADMIN'],
        userRole: undefined,
      });
      const guard = new RolesGuard(reflector as any);
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('lanza ForbiddenException si el rol del usuario no está en la lista', () => {
      const { ctx, reflector } = makeContext({
        requiredRoles: ['SUPER_ADMIN', 'ADMIN'],
        userRole: 'USER',
      });
      const guard = new RolesGuard(reflector as any);
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });
});
