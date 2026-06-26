-- AlterTable
ALTER TABLE "UserSecurity" ADD COLUMN     "totpPendingSecret" TEXT,
ADD COLUMN     "totpSecret" TEXT;
