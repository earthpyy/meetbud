-- AlterTable
ALTER TABLE "summaries" ADD COLUMN     "inputTokens" INTEGER,
ADD COLUMN     "outputTokens" INTEGER;

-- CreateTable
CREATE TABLE "workspace_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "aiApiKey" TEXT,
    "aiBaseUrl" TEXT NOT NULL DEFAULT 'https://api.anthropic.com',
    "aiModel" TEXT NOT NULL DEFAULT 'claude-opus-4-8',
    "aiTemperature" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "aiSystemPrompt" TEXT NOT NULL DEFAULT 'You are a meeting-notes assistant. Summarize the transcript into a concise TL;DR, key points, decisions, and action items with owners. Be specific and never invent details.',
    "recallApiKey" TEXT,
    "recallBotName" TEXT NOT NULL DEFAULT 'meetbud Notetaker',
    "recallRegion" TEXT NOT NULL DEFAULT 'us-east-1',
    "recordingRetentionDays" INTEGER NOT NULL DEFAULT 90,
    "recallAutoLeave" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_settings_pkey" PRIMARY KEY ("id")
);
