/**
 * Estados de usuario tal como se representan en Prisma/base de datos.
 *
 * @remarks
 * Espejo del enum de dominio `UserStatus`
 * (`domain/enums/user-status.enum.ts`). Se mantiene separado para no
 * acoplar el dominio al cliente generado de Prisma; la traducción entre
 * ambos ocurre en `UserMapper`.
 */
export enum PrismaUserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
}
