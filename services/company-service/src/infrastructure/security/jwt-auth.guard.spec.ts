import { UnauthorizedException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

import { JwtAuthGuard } from './jwt-auth.guard';

const SECRET = 'a'.repeat(40);

const buildContext = (cookies?: Record<string, string>) => {
  const request: any = { cookies };

  return {
    request,
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as any,
  };
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard({ get: () => SECRET } as any);
  });

  const signToken = (payload: Record<string, unknown>, overrides: Record<string, unknown> = {}) =>
    sign(payload, SECRET, {
      issuer: 'auth-service',
      audience: 'api-gateway',
      algorithm: 'HS256',
      expiresIn: 900,
      ...overrides,
    });

  it('acepta un token válido y publica req.user', () => {
    const token = signToken({ sub: 'u-1', sid: 's-1', role: 'CUSTOMER' });
    const { request, context } = buildContext({ accessToken: token });

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: 'u-1', sessionId: 's-1', role: 'CUSTOMER' });
  });

  it('rechaza si no hay cookie', () => {
    const { context } = buildContext();

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rechaza si no hay accessToken en las cookies', () => {
    const { context } = buildContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rechaza un token firmado con otro secreto', () => {
    const token = sign({ sub: 'u-1', sid: 's-1' }, 'b'.repeat(40), {
      issuer: 'auth-service',
      audience: 'api-gateway',
    });
    const { context } = buildContext({ accessToken: token });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rechaza un token con otro issuer', () => {
    const token = signToken({ sub: 'u-1', sid: 's-1' }, { issuer: 'otro-service' });
    const { context } = buildContext({ accessToken: token });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rechaza un token sin sid', () => {
    const token = signToken({ sub: 'u-1' });
    const { context } = buildContext({ accessToken: token });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
