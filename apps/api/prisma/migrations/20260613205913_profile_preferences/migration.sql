-- CreateEnum
CREATE TYPE "AutoRecord" AS ENUM ('all', 'organized', 'off');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "autoRecord" "AutoRecord" NOT NULL DEFAULT 'organized',
    "joinEarly" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnSummary" BOOLEAN NOT NULL DEFAULT true,
    "customPromptEnabled" BOOLEAN NOT NULL DEFAULT false,
    "customPrompt" TEXT,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "slackSummaries" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
