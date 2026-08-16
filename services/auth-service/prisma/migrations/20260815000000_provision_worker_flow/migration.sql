-- AlterTable
ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserProfile" ALTER COLUMN "dataProcessingAcceptedAt" DROP NOT NULL,
ALTER COLUMN "termsAcceptedAt" DROP NOT NULL;
