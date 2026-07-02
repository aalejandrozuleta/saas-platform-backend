import { timingSafeEqual } from 'node:crypto';

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PUBLIC_ROUTE_KEY } from '@saas/shared';
import { EnvService } from '@config/env/env.service';

export const INTERNAL_SERVICE_HEADER = 'x-internal-api-key';

/**
 * notification-service no valida sesiones de usuario ni tiene gateway propio
 * delante: cualquier servicio (o cliente) que alcance su puerto en la red
 * puede llamarlo directamente. Este guard exige un secreto compartido con
 * auth-service en cada petición para cerrar ese perímetro.
 */
@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly env: EnvService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.headers[INTERNAL_SERVICE_HEADER];

    if (
      typeof provided !== 'string' ||
      !this.matches(provided, this.env.get('INTERNAL_SERVICE_SECRET'))
    ) {
      throw new UnauthorizedException({ messageKey: 'common.unauthorized' });
    }

    return true;
  }

  private matches(provided: string, expected: string): boolean {
    const providedBuf = Buffer.from(provided);
    const expectedBuf = Buffer.from(expected);
    if (providedBuf.length !== expectedBuf.length) {
      return false;
    }
    return timingSafeEqual(providedBuf, expectedBuf);
  }
}
