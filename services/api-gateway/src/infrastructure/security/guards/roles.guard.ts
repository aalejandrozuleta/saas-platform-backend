import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '@saas/shared';

/**
 * Guard de autorización basado en roles.
 *
 * Se ejecuta después de JwtSessionGuard (que ya validó el JWT y
 * pobló req.user con el rol del usuario). Si el endpoint no tiene
 * @Roles(), el guard lo deja pasar sin restricciones de rol.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const userRole = req.user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException({ messageKey: 'common.forbidden' });
    }

    return true;
  }
}
