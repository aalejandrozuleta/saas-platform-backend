import { SetMetadata } from '@nestjs/common';
import { Permission } from '../permissions/permission.enum';

export const PERMISSION_KEY = 'requiredPermission';

/**
 * Restringe un endpoint a usuarios que posean el permiso indicado.
 *
 * El PermissionGuard del API Gateway lee esta metadata y comprueba
 * que req.user.permissions incluye el permiso requerido.
 *
 * @example
 * \@RequirePermission(Permission.INVOICE_DELETE)
 * \@Delete(':id')
 * remove(@Param('id') id: string) { ... }
 */
export const RequirePermission = (permission: Permission) =>
  SetMetadata(PERMISSION_KEY, permission);
