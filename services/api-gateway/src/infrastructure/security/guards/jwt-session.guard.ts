import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Redis } from 'ioredis';
import { verify, JwtPayload } from 'jsonwebtoken';
import { EnvService } from '@config/env/env.service';
import {
  REDIS_CLIENT,
  PUBLIC_ROUTE_KEY,
} from '@saas/shared';

interface AccessTokenPayload extends JwtPayload {
  sub: string;
  sid: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        sessionId: string;
        role: string;
        permissions: string[];
      };
    }
  }
}

/**
 * Guard global de autenticación del API Gateway.
 *
 * @remarks
 * Valida el `accessToken` de la cookie en dos pasos:
 *  1. Verifica firma y claims del JWT (issuer, audience, expiración).
 *  2. Confirma que la sesión sigue activa en Redis (`session:<sid>`).
 *
 * Las rutas marcadas con `@PublicRoute()` omiten ambas validaciones.
 * En caso de éxito, inyecta `req.user` con `{ id, sessionId }`.
 */
@Injectable()
export class JwtSessionGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector,
    private readonly envService: EnvService,

    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    if (isPublic) {
      return true;
    }

    const req = context
      .switchToHttp()
      .getRequest<Request>();

    const token = this.extractTokenFromCookie(req);

    const payload = this.verifyToken(token);

    const sessionRaw = await this.redis.get(`session:${payload.sid}`);

    if (!sessionRaw) {
      throw new UnauthorizedException({
        messageKey: 'common.session_expired',
      });
    }

    let permissions: string[] = [];
    try {
      const sessionData = JSON.parse(sessionRaw) as { permissions?: string[] };
      permissions = Array.isArray(sessionData.permissions) ? sessionData.permissions : [];
    } catch {
      // valor Redis corrupto: sesión válida pero sin permisos
    }

    req.user = {
      id: payload.sub,
      sessionId: payload.sid,
      role: payload.role,
      permissions,
    };

    return true;
  }

  /**
   * Extrae accessToken desde cookie
   */
  private extractTokenFromCookie(req: Request): string {

    const token = req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException({
        messageKey: 'common.missing_access_token',
      });
    }

    return token;
  }

  /**
   * Verifica JWT
   */
  private verifyToken(
    token: string,
  ): AccessTokenPayload {

    try {

      const payload = verify(
        token,
        this.envService.get('JWT_ACCESS_SECRET'),
        {
          issuer: 'auth-service',
          audience: 'api-gateway',
        },
      ) as AccessTokenPayload;

      if (!payload.sub || !payload.sid || !payload.role) {
        throw new UnauthorizedException({
          messageKey: 'common.invalid_token',
        });
      }

      return payload;

    } catch {
      throw new UnauthorizedException({
        messageKey: 'common.invalid_token',
      });
    }
  }
}