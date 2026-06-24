import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorador para restringir un endpoint a uno o más roles.
 * El RolesGuard lee esta metadata para tomar la decisión.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
