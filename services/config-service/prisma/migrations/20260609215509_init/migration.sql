/*
  Warnings:

  - You are about to drop the column `metadata` on the `FeatureFlag` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `FeatureFlag` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `FeatureFlag` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `MaintenanceWindow` table. All the data in the column will be lost.
  - You are about to drop the `AllowedDomain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AppConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IpRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordPolicy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RateLimitConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TenantConfig` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[key,environment]` on the table `FeatureFlag` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FeatureFlag_key_tenantId_role_environment_key";

-- DropIndex
DROP INDEX "FeatureFlag_tenantId_idx";

-- DropIndex
DROP INDEX "MaintenanceWindow_tenantId_idx";

-- AlterTable
ALTER TABLE "FeatureFlag" DROP COLUMN "metadata",
DROP COLUMN "role",
DROP COLUMN "tenantId",
ALTER COLUMN "enabled" SET DEFAULT true;

-- AlterTable
ALTER TABLE "MaintenanceWindow" DROP COLUMN "tenantId";

-- DropTable
DROP TABLE "AllowedDomain";

-- DropTable
DROP TABLE "AppConfig";

-- DropTable
DROP TABLE "IpRule";

-- DropTable
DROP TABLE "PasswordPolicy";

-- DropTable
DROP TABLE "RateLimitConfig";

-- DropTable
DROP TABLE "TenantConfig";

-- DropEnum
DROP TYPE "ConfigCategory";

-- DropEnum
DROP TYPE "IpRuleType";

-- DropEnum
DROP TYPE "PlanType";

-- CreateTable
CREATE TABLE "MaintenanceConfig" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "readOnly" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_environment_key" ON "FeatureFlag"("key", "environment");
