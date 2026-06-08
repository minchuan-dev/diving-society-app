-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "passwordHash" TEXT,
    "wechatOpenId" TEXT,
    "authProvider" TEXT NOT NULL DEFAULT 'EMAIL',
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "certLevel" TEXT NOT NULL DEFAULT 'OW',
    "diveCount" INTEGER NOT NULL DEFAULT 0,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("approved", "certLevel", "createdAt", "diveCount", "email", "emergencyContactName", "emergencyContactPhone", "id", "name", "passwordHash", "phone", "role", "updatedAt") SELECT "approved", "certLevel", "createdAt", "diveCount", "email", "emergencyContactName", "emergencyContactPhone", "id", "name", "passwordHash", "phone", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_wechatOpenId_key" ON "User"("wechatOpenId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "OtpCode_email_idx" ON "OtpCode"("email");
