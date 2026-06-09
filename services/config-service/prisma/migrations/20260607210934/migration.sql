-- CreateEnum
CREATE TYPE "ConfigCategory" AS ENUM ('MAINTENANCE', 'SECURITY', 'PERFORMANCE', 'NOTIFICATIONS', 'GENERAL');

-- CreateEnum
CREATE TYPE "IpRuleType" AS ENUM ('WHITELIST', 'BLACKLIST');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" "ConfigCategory" NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "role" TEXT,
    "environment" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT,
    "logoUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "plan" "PlanType" NOT NULL DEFAULT 'FREE',
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "maxStorage" INTEGER NOT NULL DEFAULT 1024,
    "customData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpRule" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "cidr" TEXT,
    "type" "IpRuleType" NOT NULL,
    "tenantId" TEXT,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceWindow" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notifiedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitConfig" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "maxRequests" INTEGER NOT NULL,
    "windowSeconds" INTEGER NOT NULL,
    "tenantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordPolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "minLength" INTEGER NOT NULL DEFAULT 8,
    "requireUppercase" BOOLEAN NOT NULL DEFAULT true,
    "requireLowercase" BOOLEAN NOT NULL DEFAULT true,
    "requireNumbers" BOOLEAN NOT NULL DEFAULT true,
    "requireSymbols" BOOLEAN NOT NULL DEFAULT false,
    "maxAgeDays" INTEGER,
    "historyCount" INTEGER NOT NULL DEFAULT 5,
    "maxConcurrentSessions" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllowedDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllowedDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_key_key" ON "AppConfig"("key");

-- CreateIndex
CREATE INDEX "AppConfig_category_idx" ON "AppConfig"("category");

-- CreateIndex
CREATE INDEX "FeatureFlag_key_idx" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "FeatureFlag_tenantId_idx" ON "FeatureFlag"("tenantId");

-- CreateIndex
CREATE INDEX "FeatureFlag_enabled_idx" ON "FeatureFlag"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_tenantId_role_environment_key" ON "FeatureFlag"("key", "tenantId", "role", "environment");

-- CreateIndex
CREATE UNIQUE INDEX "TenantConfig_tenantId_key" ON "TenantConfig"("tenantId");

-- CreateIndex
CREATE INDEX "TenantConfig_plan_idx" ON "TenantConfig"("plan");

-- CreateIndex
CREATE INDEX "TenantConfig_isActive_idx" ON "TenantConfig"("isActive");

-- CreateIndex
CREATE INDEX "IpRule_type_idx" ON "IpRule"("type");

-- CreateIndex
CREATE INDEX "IpRule_tenantId_idx" ON "IpRule"("tenantId");

-- CreateIndex
CREATE INDEX "IpRule_expiresAt_idx" ON "IpRule"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "IpRule_ip_tenantId_key" ON "IpRule"("ip", "tenantId");

-- CreateIndex
CREATE INDEX "MaintenanceWindow_startAt_idx" ON "MaintenanceWindow"("startAt");

-- CreateIndex
CREATE INDEX "MaintenanceWindow_endAt_idx" ON "MaintenanceWindow"("endAt");

-- CreateIndex
CREATE INDEX "MaintenanceWindow_isActive_idx" ON "MaintenanceWindow"("isActive");

-- CreateIndex
CREATE INDEX "MaintenanceWindow_tenantId_idx" ON "MaintenanceWindow"("tenantId");

-- CreateIndex
CREATE INDEX "RateLimitConfig_isActive_idx" ON "RateLimitConfig"("isActive");

-- CreateIndex
CREATE INDEX "RateLimitConfig_tenantId_idx" ON "RateLimitConfig"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitConfig_endpoint_tenantId_key" ON "RateLimitConfig"("endpoint", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordPolicy_tenantId_key" ON "PasswordPolicy"("tenantId");

-- CreateIndex
CREATE INDEX "AllowedDomain_tenantId_idx" ON "AllowedDomain"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AllowedDomain_domain_tenantId_key" ON "AllowedDomain"("domain", "tenantId");
