import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { type EnvService } from '@config/env/env.service';

import { JwtAuthGuard } from './jwt-auth.guard';

const SECRET = 'test-secret';

const mockEnvService = {
  get: jest.fn().mockReturnValue(SECRET),
} as unknown as EnvService;

function makeContext(cookies: Record<string, string>): ExecutionContext {
  const req: any = { cookies, user: undefined };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

function validToken(overrides: Partial<Record<string, unknown>> = {}): string {
  return sign({ sub: 'user-1', sid: 'session-1', role: 'USER', ...overrides }, SECRET, {
    issuer: 'auth-service',
    audience: 'api-gateway',
  });
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard(mockEnvService);
  });

  it('inyecta req.user con id y sessionId desde el JWT', () => {
    const token = validToken();
    const ctx = makeContext({ accessToken: token });

    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
    const req = ctx.switchToHttp().getRequest();
    expect(req.user).toEqual({ id: 'user-1', sessionId: 'session-1', role: 'USER' });
  });

  it('lanza UnauthorizedException si no hay cookie accessToken', () => {
    const ctx = makeContext({});
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('lanza UnauthorizedException si el token está firmado con secreto incorrecto', () => {
    const token = sign({ sub: 'u1', sid: 's1', role: 'USER' }, 'wrong-secret', {
      issuer: 'auth-service',
      audience: 'api-gateway',
    });
    const ctx = makeContext({ accessToken: token });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('lanza UnauthorizedException si el token ha expirado', () => {
    const token = sign({ sub: 'u1', sid: 's1', role: 'USER' }, SECRET, {
      issuer: 'auth-service',
      audience: 'api-gateway',
      expiresIn: -1,
    });
    const ctx = makeContext({ accessToken: token });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('lanza UnauthorizedException si el payload no tiene sub', () => {
    const token = sign({ sid: 's1', role: 'USER' }, SECRET, {
      issuer: 'auth-service',
      audience: 'api-gateway',
    });
    const ctx = makeContext({ accessToken: token });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('lanza UnauthorizedException si el issuer es incorrecto', () => {
    const token = sign({ sub: 'u1', sid: 's1', role: 'USER' }, SECRET, {
      issuer: 'otro-servicio',
      audience: 'api-gateway',
    });
    const ctx = makeContext({ accessToken: token });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
