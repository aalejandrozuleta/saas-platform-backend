"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Seed del sistema de permisos.
 *
 * Pobla el catálogo de permisos (Permission) y los permisos
 * predeterminados de cada rol (RolePermission).
 *
 * Ejecutar:  npx prisma db seed
 * (o automáticamente en prisma migrate deploy en CI)
 */
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_1 = require("../src/generated/prisma");
const role_permissions_map_1 = require("../../../shared/permissions/role-permissions.map");
const permission_enum_1 = require("../../../shared/permissions/permission.enum");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env['DATABASE_URL'] });
const prisma = new prisma_1.PrismaClient({ adapter });
/** Metadatos legibles para cada permiso (descripción + módulo) */
const PERMISSION_META = {
    // Plataforma
    [permission_enum_1.Permission.PLATFORM_MAINTENANCE]: { description: 'Activar/desactivar mantenimiento de la plataforma', module: 'platform' },
    [permission_enum_1.Permission.PLATFORM_FEATURE_FLAGS]: { description: 'Gestionar feature flags de la plataforma', module: 'platform' },
    [permission_enum_1.Permission.PLATFORM_TENANTS]: { description: 'Gestionar tenants/organizaciones en la plataforma', module: 'platform' },
    // Organización
    [permission_enum_1.Permission.ORG_MANAGE]: { description: 'Gestionar configuración de la organización', module: 'org' },
    [permission_enum_1.Permission.ORG_READ]: { description: 'Ver información de la organización', module: 'org' },
    // Sucursales
    [permission_enum_1.Permission.BRANCH_CREATE]: { description: 'Crear sucursales', module: 'branch' },
    [permission_enum_1.Permission.BRANCH_EDIT]: { description: 'Editar sucursales', module: 'branch' },
    [permission_enum_1.Permission.BRANCH_CLOSE]: { description: 'Cerrar sucursales', module: 'branch' },
    [permission_enum_1.Permission.BRANCH_READ]: { description: 'Ver detalle de una sucursal', module: 'branch' },
    [permission_enum_1.Permission.BRANCH_LIST]: { description: 'Listar sucursales', module: 'branch' },
    // Empleados
    [permission_enum_1.Permission.EMPLOYEE_HIRE]: { description: 'Contratar empleados', module: 'employee' },
    [permission_enum_1.Permission.EMPLOYEE_FIRE]: { description: 'Despedir empleados', module: 'employee' },
    [permission_enum_1.Permission.EMPLOYEE_MANAGE_PERMISSIONS]: { description: 'Modificar permisos de empleados de su organización', module: 'employee' },
    [permission_enum_1.Permission.EMPLOYEE_READ]: { description: 'Ver detalle de un empleado', module: 'employee' },
    [permission_enum_1.Permission.EMPLOYEE_LIST]: { description: 'Listar empleados de la organización', module: 'employee' },
    // Facturas
    [permission_enum_1.Permission.INVOICE_CREATE]: { description: 'Crear facturas', module: 'invoice' },
    [permission_enum_1.Permission.INVOICE_READ]: { description: 'Ver cualquier factura', module: 'invoice' },
    [permission_enum_1.Permission.INVOICE_EDIT]: { description: 'Editar facturas', module: 'invoice' },
    [permission_enum_1.Permission.INVOICE_DELETE]: { description: 'Eliminar facturas', module: 'invoice' },
    [permission_enum_1.Permission.INVOICE_LIST]: { description: 'Listar facturas', module: 'invoice' },
    [permission_enum_1.Permission.INVOICE_APPROVE]: { description: 'Aprobar facturas', module: 'invoice' },
    [permission_enum_1.Permission.INVOICE_READ_OWN]: { description: 'Ver únicamente las facturas propias', module: 'invoice' },
    // Ventas
    [permission_enum_1.Permission.SALE_CREATE]: { description: 'Crear ventas', module: 'sale' },
    [permission_enum_1.Permission.SALE_READ]: { description: 'Ver ventas', module: 'sale' },
    [permission_enum_1.Permission.SALE_EDIT]: { description: 'Editar ventas', module: 'sale' },
    [permission_enum_1.Permission.SALE_DELETE]: { description: 'Eliminar ventas', module: 'sale' },
    [permission_enum_1.Permission.SALE_LIST]: { description: 'Listar ventas', module: 'sale' },
    // Finanzas
    [permission_enum_1.Permission.FINANCE_READ]: { description: 'Ver datos financieros', module: 'finance' },
    [permission_enum_1.Permission.FINANCE_EXPORT]: { description: 'Exportar reportes financieros', module: 'finance' },
    [permission_enum_1.Permission.FINANCE_MANAGE]: { description: 'Gestionar configuración financiera', module: 'finance' },
    // Reportes
    [permission_enum_1.Permission.REPORT_READ]: { description: 'Ver reportes y estadísticas', module: 'report' },
    [permission_enum_1.Permission.REPORT_EXPORT]: { description: 'Exportar reportes', module: 'report' },
    // Pagos
    [permission_enum_1.Permission.PAYMENT_CREATE]: { description: 'Crear pagos de facturas', module: 'payment' },
    [permission_enum_1.Permission.PAYMENT_READ]: { description: 'Ver historial de pagos', module: 'payment' },
    // Perfil
    [permission_enum_1.Permission.PROFILE_MANAGE]: { description: 'Gestionar perfil propio', module: 'profile' },
};
async function main() {
    console.log('🌱  Seeding permissions...');
    // 1. Upsert catálogo de permisos
    const permissionCodes = Object.values(permission_enum_1.Permission);
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
    for (const [role, perms] of Object.entries(role_permissions_map_1.ROLE_PERMISSIONS)) {
        for (const permCode of perms) {
            await prisma.rolePermission.upsert({
                where: { role_permissionCode: { role: role, permissionCode: permCode } },
                update: {},
                create: { role: role, permissionCode: permCode },
            });
        }
        console.log(`   ✔ ${role}: ${perms.length} permisos`);
        totalRolePerms += perms.length;
    }
    console.log(`   ✔ ${totalRolePerms} asignaciones rol-permiso sincronizadas`);
    console.log('✅  Seed completado.');
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map