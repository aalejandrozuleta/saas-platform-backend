/**
 * Puerto del repositorio de permisos.
 * Permite acceder al catálogo y a los overrides por usuario.
 */
export interface PermissionRepository {
  /** Permisos predeterminados asignados a un rol */
  findCodesByRole(role: string): Promise<string[]>;

  /** Overrides por usuario: { permissionCode, granted } */
  findUserOverrides(userId: string): Promise<Array<{ permissionCode: string; granted: boolean }>>;
}
