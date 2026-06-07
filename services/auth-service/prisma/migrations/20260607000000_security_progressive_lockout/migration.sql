-- Add lockoutCount for progressive lockout (5min → 15min → 30min → 60min)
ALTER TABLE "User" ADD COLUMN "lockoutCount" INTEGER NOT NULL DEFAULT 0;

-- Add lastLoginAt for login tracking
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
