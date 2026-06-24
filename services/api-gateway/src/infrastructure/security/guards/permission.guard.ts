import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSION_KEY } from '@saas/shared';

/**
 * Guard global de permisos finos.
 *
 * Se ejecuta después del JwtSessionGuard (que ya cargó req.user.permissions
 * desde Redis) y del RolesGuard.
 *
 * Si un endpoint no está decorado con @RequirePermission, se deja pasar.
 * Si lo está, el usuario debe tener ese código en su array de permisos.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const permissions = req.user?.permissions ?? [];

    if (!permissions.includes(required)) {
      throw new ForbiddenException({
        messageKey: 'common.forbidden',
      });
    }

    return true;
  }
}
