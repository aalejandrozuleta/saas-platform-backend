-- ============================================================
-- Migración: Sistema de permisos + nuevos roles de usuario
-- ============================================================

-- 1. Renombrar valores del enum UserRole existente
--    ADMIN → BUSINESS_OWNER  |  USER → CUSTOMER
--    Agregar ACCOUNTANT y EMPLOYEE

ALTER TYPE "UserRole" RENAME VALUE 'ADMIN' TO 'BUSINESS_OWNER';
ALTER TYPE "UserRole" RENAME VALUE 'USER'  TO 'CUSTOMER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ACCOUNTANT';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EMPLOYEE';

-- 2. Actualizar default del campo role en User
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

-- 3. Catálogo de permisos
CREATE TABLE "Permission" (
  "code"        TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "module"      TEXT NOT NULL,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("code")
);

-- 4. Permisos por defecto de cada rol
CREATE TABLE "RolePermission" (
  "role"           "UserRole" NOT NULL,
  "permissionCode" TEXT       NOT NULL,
  CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("role", "permissionCode"),
  CONSTRAINT "RolePermission_permissionCode_fkey"
    FOREIGN KEY ("permissionCode") REFERENCES "Permission"("code") ON DELETE CASCADE
);

CREATE INDEX "RolePermission_role_idx" ON "RolePermission"("role");

-- 5. Overrides por usuario
CREATE TABLE "UserPermission" (
  "userId"         TEXT      NOT NULL,
  "permissionCode" TEXT      NOT NULL,
  "granted"        BOOLEAN   NOT NULL,
  "grantedBy"      TEXT      NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("userId", "permissionCode"),
  CONSTRAINT "UserPermission_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserPermission_permissionCode_fkey"
    FOREIGN KEY ("permissionCode") REFERENCES "Permission"("code") ON DELETE CASCADE
);

CREATE INDEX "UserPermission_userId_idx" ON "UserPermission"("userId");
