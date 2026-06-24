/**
 * Catálogo completo de permisos del sistema.
 *
 * Convención de código:  módulo:acción
 * Ejemplos:              invoice:delete  |  finance:export  |  platform:maintenance
 *
 * Módulos disponibles:
 *   platform   — operaciones de la plataforma (solo SUPER_ADMIN)
 *   org        — gestión de la organización/comercio
 *   branch     — sucursales del comercio
 *   employee   — gestión de empleados
 *   invoice    — facturas
 *   sale       — ventas
 *   finance    — datos financieros
 *   report     — reportes y estadísticas
 *   payment    — pagos (clientes)
 *   profile    — perfil propio del usuario
 */
export enum Permission {
  // ── Plataforma ──────────────────────────────────────────────────────────────
  PLATFORM_MAINTENANCE  = 'platform:maintenance',
  PLATFORM_FEATURE_FLAGS = 'platform:feature-flags',
  PLATFORM_TENANTS      = 'platform:tenants',

  // ── Organización ────────────────────────────────────────────────────────────
  ORG_MANAGE = 'org:manage',
  ORG_READ   = 'org:read',

  // ── Sucursales ───────────────────────────────────────────────────────────────
  BRANCH_CREATE = 'branch:create',
  BRANCH_EDIT   = 'branch:edit',
  BRANCH_CLOSE  = 'branch:close',
  BRANCH_READ   = 'branch:read',
  BRANCH_LIST   = 'branch:list',

  // ── Empleados ────────────────────────────────────────────────────────────────
  EMPLOYEE_HIRE               = 'employee:hire',
  EMPLOYEE_FIRE               = 'employee:fire',
  EMPLOYEE_MANAGE_PERMISSIONS = 'employee:manage-permissions',
  EMPLOYEE_READ               = 'employee:read',
  EMPLOYEE_LIST               = 'employee:list',

  // ── Facturas ─────────────────────────────────────────────────────────────────
  INVOICE_CREATE   = 'invoice:create',
  INVOICE_READ     = 'invoice:read',
  INVOICE_EDIT     = 'invoice:edit',
  INVOICE_DELETE   = 'invoice:delete',
  INVOICE_LIST     = 'invoice:list',
  INVOICE_APPROVE  = 'invoice:approve',
  INVOICE_READ_OWN = 'invoice:read-own',   // solo las propias (CUSTOMER)

  // ── Ventas ───────────────────────────────────────────────────────────────────
  SALE_CREATE = 'sale:create',
  SALE_READ   = 'sale:read',
  SALE_EDIT   = 'sale:edit',
  SALE_DELETE = 'sale:delete',
  SALE_LIST   = 'sale:list',

  // ── Finanzas ─────────────────────────────────────────────────────────────────
  FINANCE_READ   = 'finance:read',
  FINANCE_EXPORT = 'finance:export',
  FINANCE_MANAGE = 'finance:manage',

  // ── Reportes ─────────────────────────────────────────────────────────────────
  REPORT_READ   = 'report:read',
  REPORT_EXPORT = 'report:export',

  // ── Pagos ────────────────────────────────────────────────────────────────────
  PAYMENT_CREATE = 'payment:create',
  PAYMENT_READ   = 'payment:read',

  // ── Perfil ───────────────────────────────────────────────────────────────────
  PROFILE_MANAGE = 'profile:manage',
}
