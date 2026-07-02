import { UnauthorizedException } from '@nestjs/common';
import { type Reflector } from '@nestjs/core';
import { type EnvService } from '@config/env/env.service';

import { InternalServiceGuard, INTERNAL_SERVICE_HEADER } from './internal-service.guard';

const EXPECTED_SECRET = 'a'.repeat(32);

const makeContext = (
  overrides: {
    isPublic?: boolean;
    header?: string | undefined;
  } = {},
) => {
  const req: any = {
    headers: overrides.header !== undefined ? { [INTERNAL_SERVICE_HEADER]: overrides.header } : {},
  };

  const reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>> = {
    getAllAndOverride: jest.fn().mockReturnValue(overrides.isPublic),
  };

  const env = {
    get: jest.fn().mockReturnValue(EXPECTED_SECRET),
  } as unknown as EnvService;

  const ctx: any = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => req }),
  };

  return { ctx, reflector, env };
};

describe('InternalServiceGuard', () => {
  describe('cuando la ruta es pública (@PublicRoute)', () => {
    it('permite el acceso sin exigir el header', () => {
      const { ctx, reflector, env } = makeContext({ isPublic: true, header: undefined });
      const guard = new InternalServiceGuard(reflector as any, env);
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('cuando la ruta no es pública', () => {
    it('permite el acceso si el header coincide con el secreto configurado', () => {
      const { ctx, reflector, env } = makeContext({ isPublic: false, header: EXPECTED_SECRET });
      const guard = new InternalServiceGuard(reflector as any, env);
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('lanza UnauthorizedException si falta el header', () => {
      const { ctx, reflector, env } = makeContext({ isPublic: false, header: undefined });
      const guard = new InternalServiceGuard(reflector as any, env);
      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el header no coincide con el secreto', () => {
      const { ctx, reflector, env } = makeContext({ isPublic: false, header: 'wrong-secret' });
      const guard = new InternalServiceGuard(reflector as any, env);
      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el header tiene distinta longitud que el secreto (sin comparación insegura)', () => {
      const { ctx, reflector, env } = makeContext({
        isPublic: false,
        header: EXPECTED_SECRET + 'extra',
      });
      const guard = new InternalServiceGuard(reflector as any, env);
      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });
  });
});
