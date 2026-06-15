-- CreateEnum
CREATE TYPE "MeetingPlatform" AS ENUM ('meet', 'zoom', 'teams');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('upcoming', 'ongoing', 'transcribing', 'summarizing', 'done');

-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('scheduled', 'joining', 'in_call', 'recording', 'done', 'failed');

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platform" "MeetingPlatform" NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'upcoming',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "joinUrl" TEXT,
    "recordingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "organizerId" TEXT NOT NULL,
    "calendarEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "title" TEXT,
    "isOrganizer" BOOLEAN NOT NULL DEFAULT false,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "recallParticipantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recordings" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "recallBotId" TEXT,
    "recallRecordingId" TEXT,
    "status" "RecordingStatus" NOT NULL DEFAULT 'scheduled',
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "mediaExpiresAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcript_segments" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "participantId" TEXT,
    "startSec" DOUBLE PRECISION NOT NULL,
    "endSec" DOUBLE PRECISION,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transcript_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summaries" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "tldr" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "model" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meetings_organizerId_idx" ON "meetings"("organizerId");

-- CreateIndex
CREATE INDEX "participants_meetingId_idx" ON "participants"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "participants_meetingId_userId_key" ON "participants"("meetingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "recordings_meetingId_key" ON "recordings"("meetingId");

-- CreateIndex
CREATE INDEX "transcript_segments_meetingId_startSec_idx" ON "transcript_segments"("meetingId", "startSec");

-- CreateIndex
CREATE UNIQUE INDEX "summaries_meetingId_key" ON "summaries"("meetingId");

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcript_segments" ADD CONSTRAINT "transcript_segments_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcript_segments" ADD CONSTRAINT "transcript_segments_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
