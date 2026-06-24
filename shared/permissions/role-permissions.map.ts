import { Permission } from './permission.enum';

/**
 * Permisos predeterminados por rol.
 *
 * Este mapa es la única fuente de verdad para el seed de la BD.
 * Si necesitas ajustar los permisos por defecto de un rol,
 * edita aquí y vuelve a ejecutar el seed (prisma db seed).
 *
 * Para overrides por usuario usa la tabla UserPermission.
 *
 * Claves: valores del enum UserRole (strings).
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {

  /**
   * SUPER_ADMIN — Operador de la plataforma.
   * Tiene acceso a absolutamente todo.
   */
  SUPER_ADMIN: Object.values(Permission),

  /**
   * BUSINESS_OWNER — Dueño del comercio.
   * Gestión completa de su organización: sucursales, empleados,
   * facturas, ventas, finanzas y reportes. NO accede a configuración
   * de plataforma.
   */
  BUSINESS_OWNER: [
    Permission.ORG_MANAGE,
    Permission.ORG_READ,
    Permission.BRANCH_CREATE,
    Permission.BRANCH_EDIT,
    Permission.BRANCH_CLOSE,
    Permission.BRANCH_READ,
    Permission.BRANCH_LIST,
    Permission.EMPLOYEE_HIRE,
    Permission.EMPLOYEE_FIRE,
    Permission.EMPLOYEE_MANAGE_PERMISSIONS,
    Permission.EMPLOYEE_READ,
    Permission.EMPLOYEE_LIST,
    Permission.INVOICE_CREATE,
    Permission.INVOICE_READ,
    Permission.INVOICE_EDIT,
    Permission.INVOICE_DELETE,
    Permission.INVOICE_LIST,
    Permission.INVOICE_APPROVE,
    Permission.SALE_CREATE,
    Permission.SALE_READ,
    Permission.SALE_EDIT,
    Permission.SALE_DELETE,
    Permission.SALE_LIST,
    Permission.FINANCE_READ,
    Permission.FINANCE_EXPORT,
    Permission.FINANCE_MANAGE,
    Permission.REPORT_READ,
    Permission.REPORT_EXPORT,
    Permission.PROFILE_MANAGE,
  ],

  /**
   * ACCOUNTANT — Contador del comercio.
   * Solo lectura de datos financieros, facturas y ventas.
   * No puede crear, editar ni eliminar nada.
   */
  ACCOUNTANT: [
    Permission.ORG_READ,
    Permission.INVOICE_READ,
    Permission.INVOICE_LIST,
    Permission.SALE_READ,
    Permission.SALE_LIST,
    Permission.FINANCE_READ,
    Permission.FINANCE_EXPORT,
    Permission.REPORT_READ,
    Permission.REPORT_EXPORT,
    Permission.PROFILE_MANAGE,
  ],

  /**
   * EMPLOYEE — Trabajador del comercio.
   * Puede crear y editar facturas y ventas.
   * Sin acceso a finanzas, reportes ni gestión de personal.
   */
  EMPLOYEE: [
    Permission.INVOICE_CREATE,
    Permission.INVOICE_READ,
    Permission.INVOICE_EDIT,
    Permission.INVOICE_LIST,
    Permission.SALE_CREATE,
    Permission.SALE_READ,
    Permission.SALE_EDIT,
    Permission.SALE_LIST,
    Permission.PROFILE_MANAGE,
  ],

  /**
   * CUSTOMER — Persona natural externa.
   * Recibe facturas y las paga desde la aplicación.
   * Solo ve sus propias facturas y gestiona su perfil.
   */
  CUSTOMER: [
    Permission.INVOICE_READ_OWN,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_READ,
    Permission.PROFILE_MANAGE,
  ],
};
