import { UnauthorizedException } from '@nestjs/common';
import { type Reflector } from '@nestjs/core';
import { type Redis } from 'ioredis';
import { sign } from 'jsonwebtoken';
import { type EnvService } from '@config/env/env.service';

import { JwtSessionGuard } from './jwt-session.guard';

describe('JwtSessionGuard', () => {
  let guard: JwtSessionGuard;
  let reflector: jest.Mocked<Reflector>;
  let envService: jest.Mocked<EnvService>;
  let redis: jest.Mocked<Redis>;

  const SECRET = 'test-access-secret-long-enough';

  const makeContext = (overrides: {
    isPublic?: boolean;
    cookies?: Record<string, string>;
  } = {}) => {
    const req: any = {
      cookies: overrides.cookies ?? {},
      user: undefined,
    };

    const ctx: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => req }),
    };

    reflector.getAllAndOverride.mockReturnValue(overrides.isPublic ?? false);

    return { ctx, req };
  };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    envService = { get: jest.fn().mockReturnValue(SECRET) } as any;
    redis = { get: jest.fn() } as any;

    guard = new JwtSessionGuard(reflector, envService, redis);
  });

  describe('ruta pública', () => {
    it('debe permitir el acceso sin validar token', async () => {
      const { ctx } = makeContext({ isPublic: true });
      const result = await guard.canActivate(ctx);
      expect(result).toBe(true);
      expect(redis.get).not.toHaveBeenCalled();
    });
  });

  describe('ruta protegida', () => {
    const makeValidToken = (payload = { sub: 'user-1', sid: 'session-1' }) =>
      sign(payload, SECRET, { issuer: 'auth-service', audience: 'api-gateway' });

    it('debe permitir acceso con token y sesión válidos', async () => {
      const token = makeValidToken();
      const { ctx, req } = makeContext({ cookies: { accessToken: token } });

      redis.get.mockResolvedValue(JSON.stringify({ userId: 'user-1' }));

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(req.user).toEqual({ id: 'user-1', sessionId: 'session-1' });
    });

    it('debe lanzar UnauthorizedException si no hay cookie accessToken', async () => {
      const { ctx } = makeContext({ cookies: {} });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar UnauthorizedException si el token es inválido', async () => {
      const { ctx } = makeContext({ cookies: { accessToken: 'bad.token.here' } });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar UnauthorizedException si la sesión no existe en Redis', async () => {
      const token = makeValidToken();
      const { ctx } = makeContext({ cookies: { accessToken: token } });

      redis.get.mockResolvedValue(null);

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar UnauthorizedException si el payload no tiene sub o sid', async () => {
      // Token válido pero con payload incompleto (sin sub/sid)
      const token = sign({ data: 'no-sub-no-sid' }, SECRET, {
        issuer: 'auth-service',
        audience: 'api-gateway',
      });
      const { ctx } = makeContext({ cookies: { accessToken: token } });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
