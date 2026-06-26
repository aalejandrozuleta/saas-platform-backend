import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { verify, type JwtPayload } from 'jsonwebtoken';
import { EnvService } from '@config/env/env.service';

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
      };
    }
  }
}

/**
 * Guard de autenticación para el auth-service.
 *
 * Verifica el accessToken de la cookie con la clave JWT firmada.
 * Extrae userId y sessionId del payload verificado, nunca de headers.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {

  constructor(private readonly envService: EnvService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const token = req.cookies?.accessToken as string | undefined;
    if (!token) {
      throw new UnauthorizedException();
    }

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
        throw new UnauthorizedException();
      }

      req.user = {
        id: payload.sub,
        sessionId: payload.sid,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
