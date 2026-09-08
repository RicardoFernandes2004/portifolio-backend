-- AlterTable: 2FA (TOTP) e reset de senha. Tudo nullable ou com default:
-- o usuário existente continua logando por senha até enrolar o 2FA.
ALTER TABLE "User" ADD COLUMN "twoFactorSecret" TEXT,
                   ADD COLUMN "twoFactorEnabledAt" TIMESTAMP(3),
                   ADD COLUMN "twoFactorBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
                   ADD COLUMN "passwordResetTokenHash" TEXT,
                   ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3);
