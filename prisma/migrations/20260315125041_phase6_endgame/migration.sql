-- CreateEnum
CREATE TYPE "RaidDifficulty" AS ENUM ('NORMAL', 'HEROIC', 'MYTHIC');

-- CreateEnum
CREATE TYPE "RaidStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "BossElement" AS ENUM ('FIRE', 'ICE', 'THUNDER', 'SHADOW', 'POISON', 'HOLY');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('DOUBLE_DROP', 'DOUBLE_GOLD', 'BOSS_WORLD', 'FLASH_TOURNAMENT', 'TRAIT_BOOST');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED');

-- AlterEnum
ALTER TYPE "League" ADD VALUE 'MYTHIC';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "prestigeLevel" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "RaidBoss" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "element" "BossElement" NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "mechanic" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaidBoss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Raid" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "bossId" TEXT NOT NULL,
    "difficulty" "RaidDifficulty" NOT NULL,
    "currentHp" INTEGER NOT NULL,
    "status" "RaidStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Raid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaidAttempt" (
    "id" TEXT NOT NULL,
    "raidId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "damageDealt" INTEGER NOT NULL,
    "roundsData" JSONB NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaidAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaidReward" (
    "id" TEXT NOT NULL,
    "raidId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goldReward" INTEGER NOT NULL,
    "gemReward" INTEGER NOT NULL,
    "itemId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaidReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameEvent" (
    "id" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventParticipation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RaidBoss_name_key" ON "RaidBoss"("name");

-- CreateIndex
CREATE INDEX "Raid_guildId_idx" ON "Raid"("guildId");

-- CreateIndex
CREATE INDEX "RaidAttempt_raidId_idx" ON "RaidAttempt"("raidId");

-- CreateIndex
CREATE INDEX "RaidAttempt_userId_idx" ON "RaidAttempt"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RaidReward_raidId_userId_key" ON "RaidReward"("raidId", "userId");

-- CreateIndex
CREATE INDEX "EventParticipation_eventId_idx" ON "EventParticipation"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipation_eventId_userId_key" ON "EventParticipation"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "Raid" ADD CONSTRAINT "Raid_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Raid" ADD CONSTRAINT "Raid_bossId_fkey" FOREIGN KEY ("bossId") REFERENCES "RaidBoss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidAttempt" ADD CONSTRAINT "RaidAttempt_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidAttempt" ADD CONSTRAINT "RaidAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidReward" ADD CONSTRAINT "RaidReward_raidId_fkey" FOREIGN KEY ("raidId") REFERENCES "Raid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaidReward" ADD CONSTRAINT "RaidReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipation" ADD CONSTRAINT "EventParticipation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "GameEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipation" ADD CONSTRAINT "EventParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
