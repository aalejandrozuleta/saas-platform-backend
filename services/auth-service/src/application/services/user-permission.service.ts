import { Inject, Injectable } from '@nestjs/common';
import { PermissionRepository } from '@application/ports/permission.repository';
import { PERMISSION_REPOSITORY } from '@domain/token/repositories.tokens';

@Injectable()
export class UserPermissionService {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepo: PermissionRepository,
  ) {}

  /**
   * Computes the effective permission set for a user.
   *
   * Algorithm:
   * 1. Start from the role's default permissions (RolePermission rows).
   * 2. Apply per-user overrides (UserPermission rows):
   *    - granted = true  → add the permission even if not in role defaults
   *    - granted = false → remove the permission even if it was in role defaults
   */
  async getEffectivePermissions(userId: string, role: string): Promise<string[]> {
    const [rolePerms, overrides] = await Promise.all([
      this.permissionRepo.findCodesByRole(role),
      this.permissionRepo.findUserOverrides(userId),
    ]);

    const set = new Set(rolePerms);

    for (const override of overrides) {
      if (override.granted) {
        set.add(override.permissionCode);
      } else {
        set.delete(override.permissionCode);
      }
    }

    return [...set];
  }
}
