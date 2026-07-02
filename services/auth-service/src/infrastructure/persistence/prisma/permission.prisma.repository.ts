import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '@application/ports/permission.repository';

import { UserRole } from '../../../generated/prisma';

import { PrismaService } from './prisma.service';

@Injectable()
export class PermissionPrismaRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCodesByRole(role: string): Promise<string[]> {
    const rows = await this.prisma.rolePermission.findMany({
      where: { role: role as UserRole },
      select: { permissionCode: true },
    });
    return rows.map((r) => r.permissionCode);
  }

  async findUserOverrides(
    userId: string,
  ): Promise<Array<{ permissionCode: string; granted: boolean }>> {
    return this.prisma.userPermission.findMany({
      where: { userId },
      select: { permissionCode: true, granted: true },
    });
  }
}
