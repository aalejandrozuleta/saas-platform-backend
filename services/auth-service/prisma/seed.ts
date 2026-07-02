/**
 * Seed del sistema de permisos.
 *
 * Pobla el catálogo de permisos (Permission) y los permisos
 * predeterminados de cada rol (RolePermission).
 *
 * Ejecutar:  npx prisma db seed
 * (o automáticamente en prisma migrate deploy en CI)
 */
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient, type UserRole } from '../src/generated/prisma';
import { ROLE_PERMISSIONS } from '../../../shared/permissions/role-permissions.map';
import { Permission } from '../../../shared/permissions/permission.enum';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

/** Metadatos legibles para cada permiso (descripción + módulo) */
const PERMISSION_META: Record<Permission, { description: string; module: string }> = {
  // Plataforma
  [Permission.PLATFORM_MAINTENANCE]: {
    description: 'Activar/desactivar mantenimiento de la plataforma',
    module: 'platform',
  },
  [Permission.PLATFORM_FEATURE_FLAGS]: {
    description: 'Gestionar feature flags de la plataforma',
    module: 'platform',
  },
  [Permission.PLATFORM_TENANTS]: {
    description: 'Gestionar tenants/organizaciones en la plataforma',
    module: 'platform',
  },
  // Organización
  [Permission.ORG_MANAGE]: {
    description: 'Gestionar configuración de la organización',
    module: 'org',
  },
  [Permission.ORG_READ]: { description: 'Ver información de la organización', module: 'org' },
  // Sucursales
  [Permission.BRANCH_CREATE]: { description: 'Crear sucursales', module: 'branch' },
  [Permission.BRANCH_EDIT]: { description: 'Editar sucursales', module: 'branch' },
  [Permission.BRANCH_CLOSE]: { description: 'Cerrar sucursales', module: 'branch' },
  [Permission.BRANCH_READ]: { description: 'Ver detalle de una sucursal', module: 'branch' },
  [Permission.BRANCH_LIST]: { description: 'Listar sucursales', module: 'branch' },
  // Empleados
  [Permission.EMPLOYEE_HIRE]: { description: 'Contratar empleados', module: 'employee' },
  [Permission.EMPLOYEE_FIRE]: { description: 'Despedir empleados', module: 'employee' },
  [Permission.EMPLOYEE_MANAGE_PERMISSIONS]: {
    description: 'Modificar permisos de empleados de su organización',
    module: 'employee',
  },
  [Permission.EMPLOYEE_READ]: { description: 'Ver detalle de un empleado', module: 'employee' },
  [Permission.EMPLOYEE_LIST]: {
    description: 'Listar empleados de la organización',
    module: 'employee',
  },
  // Facturas
  [Permission.INVOICE_CREATE]: { description: 'Crear facturas', module: 'invoice' },
  [Permission.INVOICE_READ]: { description: 'Ver cualquier factura', module: 'invoice' },
  [Permission.INVOICE_EDIT]: { description: 'Editar facturas', module: 'invoice' },
  [Permission.INVOICE_DELETE]: { description: 'Eliminar facturas', module: 'invoice' },
  [Permission.INVOICE_LIST]: { description: 'Listar facturas', module: 'invoice' },
  [Permission.INVOICE_APPROVE]: { description: 'Aprobar facturas', module: 'invoice' },
  [Permission.INVOICE_READ_OWN]: {
    description: 'Ver únicamente las facturas propias',
    module: 'invoice',
  },
  // Ventas
  [Permission.SALE_CREATE]: { description: 'Crear ventas', module: 'sale' },
  [Permission.SALE_READ]: { description: 'Ver ventas', module: 'sale' },
  [Permission.SALE_EDIT]: { description: 'Editar ventas', module: 'sale' },
  [Permission.SALE_DELETE]: { description: 'Eliminar ventas', module: 'sale' },
  [Permission.SALE_LIST]: { description: 'Listar ventas', module: 'sale' },
  // Finanzas
  [Permission.FINANCE_READ]: { description: 'Ver datos financieros', module: 'finance' },
  [Permission.FINANCE_EXPORT]: { description: 'Exportar reportes financieros', module: 'finance' },
  [Permission.FINANCE_MANAGE]: {
    description: 'Gestionar configuración financiera',
    module: 'finance',
  },
  // Reportes
  [Permission.REPORT_READ]: { description: 'Ver reportes y estadísticas', module: 'report' },
  [Permission.REPORT_EXPORT]: { description: 'Exportar reportes', module: 'report' },
  // Pagos
  [Permission.PAYMENT_CREATE]: { description: 'Crear pagos de facturas', module: 'payment' },
  [Permission.PAYMENT_READ]: { description: 'Ver historial de pagos', module: 'payment' },
  // Perfil
  [Permission.PROFILE_MANAGE]: { description: 'Gestionar perfil propio', module: 'profile' },
};

async function main(): Promise<void> {
  console.log('🌱  Seeding permissions...');

  // 1. Upsert catálogo de permisos
  const permissionCodes = Object.values(Permission);
  for (const code of permissionCodes) {
    const meta = PERMISSION_META[code];
    await prisma.permission.upsert({
      where: { code },
      update: { description: meta.description, module: meta.module },
      create: { code, description: meta.description, module: meta.module },
    });
  }
  console.log(`   ✔ ${permissionCodes.length} permisos sincronizados`);

  // 2. Upsert permisos por rol
  let totalRolePerms = 0;
  for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
    for (const permCode of perms) {
      await prisma.rolePermission.upsert({
        where: { role_permissionCode: { role: role as UserRole, permissionCode: permCode } },
        update: {},
        create: { role: role as UserRole, permissionCode: permCode },
      });
    }
    console.log(`   ✔ ${role}: ${perms.length} permisos`);
    totalRolePerms += perms.length;
  }
  console.log(`   ✔ ${totalRolePerms} asignaciones rol-permiso sincronizadas`);

  console.log('✅  Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
