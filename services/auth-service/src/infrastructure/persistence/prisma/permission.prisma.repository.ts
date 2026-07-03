import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '@application/ports/permission.repository';

import { UserRole } from '../../../generated/prisma';

import { PrismaService } from './prisma.service';

/**
 * Implementación Prisma del repositorio de permisos.
 *
 * Implementa {@link PermissionRepository} combinando permisos por rol
 * (`rolePermission`) con overrides individuales por usuario (`userPermission`).
 */
@Injectable()
export class PermissionPrismaRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene los códigos de permiso asignados a un rol.
   */
  async findCodesByRole(role: string): Promise<string[]> {
    const rows = await this.prisma.rolePermission.findMany({
      where: { role: role as UserRole },
      select: { permissionCode: true },
    });
    return rows.map((r) => r.permissionCode);
  }

  /**
   * Obtiene los overrides de permisos específicos de un usuario.
   *
   * @remarks
   * `granted` indica si el override otorga (`true`) o revoca (`false`)
   * el permiso, permitiendo excepciones puntuales sobre lo que define
   * el rol vía {@link findCodesByRole}.
   */
  async findUserOverrides(
    userId: string,
  ): Promise<Array<{ permissionCode: string; granted: boolean }>> {
    return this.prisma.userPermission.findMany({
      where: { userId },
      select: { permissionCode: true, granted: true },
    });
  }
}
