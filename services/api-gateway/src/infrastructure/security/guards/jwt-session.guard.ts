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
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        sessionId: string;
      };
    }
  }
}

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

    const session = await this.redis.get(
      `session:${payload.sid}`,
    );

    if (!session) {
      throw new UnauthorizedException(
        'Session expired or revoked',
      );
    }

    req.user = {
      id: payload.sub,
      sessionId: payload.sid,
    };

    return true;
  }

  /**
   * Extrae accessToken desde cookie
   */
  private extractTokenFromCookie(req: Request): string {

    const token = req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException(
        'Missing access token',
      );
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

      if (!payload.sub || !payload.sid) {
        throw new UnauthorizedException(
          'Invalid token payload',
        );
      }

      return payload;

    } catch {
      throw new UnauthorizedException(
        'Invalid token',
      );
    }
  }
}