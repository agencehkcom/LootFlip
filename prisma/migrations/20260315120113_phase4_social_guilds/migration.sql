-- CreateEnum
CREATE TYPE "GuildRole" AS ENUM ('LEADER', 'CO_LEADER', 'OFFICER', 'MEMBER');

-- CreateEnum
CREATE TYPE "WarStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('REGISTERING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "guildId" TEXT;

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "leaderId" TEXT NOT NULL,
    "goldTreasury" INTEGER NOT NULL DEFAULT 0,
    "gemTreasury" INTEGER NOT NULL DEFAULT 0,
    "trophies" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GuildRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildAnnouncement" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildDonation" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goldAmount" INTEGER NOT NULL DEFAULT 0,
    "gemAmount" INTEGER NOT NULL DEFAULT 0,
    "itemId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildDonation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildWar" (
    "id" TEXT NOT NULL,
    "challengerGuildId" TEXT NOT NULL,
    "defenderGuildId" TEXT NOT NULL,
    "status" "WarStatus" NOT NULL DEFAULT 'PENDING',
    "challengerWins" INTEGER NOT NULL DEFAULT 0,
    "defenderWins" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildWar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildTournament" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "bracket" JSONB NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'REGISTERING',
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildTournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildChatMessage" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentOpponent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "foughtAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentOpponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "challengedId" TEXT NOT NULL,
    "goldStake" INTEGER NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'PENDING',
    "battleId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_name_key" ON "Guild"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_userId_key" ON "GuildMember"("userId");

-- CreateIndex
CREATE INDEX "GuildMember_guildId_idx" ON "GuildMember"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_guildId_userId_key" ON "GuildMember"("guildId", "userId");

-- CreateIndex
CREATE INDEX "GuildAnnouncement_guildId_idx" ON "GuildAnnouncement"("guildId");

-- CreateIndex
CREATE INDEX "GuildDonation_guildId_idx" ON "GuildDonation"("guildId");

-- CreateIndex
CREATE INDEX "GuildDonation_userId_idx" ON "GuildDonation"("userId");

-- CreateIndex
CREATE INDEX "GuildWar_challengerGuildId_idx" ON "GuildWar"("challengerGuildId");

-- CreateIndex
CREATE INDEX "GuildWar_defenderGuildId_idx" ON "GuildWar"("defenderGuildId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildTournament_weekStart_key" ON "GuildTournament"("weekStart");

-- CreateIndex
CREATE INDEX "GuildChatMessage_guildId_createdAt_idx" ON "GuildChatMessage"("guildId", "createdAt");

-- CreateIndex
CREATE INDEX "Friendship_receiverId_idx" ON "Friendship"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requesterId_receiverId_key" ON "Friendship"("requesterId", "receiverId");

-- CreateIndex
CREATE INDEX "RecentOpponent_userId_idx" ON "RecentOpponent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecentOpponent_userId_opponentId_key" ON "RecentOpponent"("userId", "opponentId");

-- CreateIndex
CREATE INDEX "Challenge_challengerId_idx" ON "Challenge"("challengerId");

-- CreateIndex
CREATE INDEX "Challenge_challengedId_idx" ON "Challenge"("challengedId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildAnnouncement" ADD CONSTRAINT "GuildAnnouncement_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildDonation" ADD CONSTRAINT "GuildDonation_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildDonation" ADD CONSTRAINT "GuildDonation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildWar" ADD CONSTRAINT "GuildWar_challengerGuildId_fkey" FOREIGN KEY ("challengerGuildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildWar" ADD CONSTRAINT "GuildWar_defenderGuildId_fkey" FOREIGN KEY ("defenderGuildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildChatMessage" ADD CONSTRAINT "GuildChatMessage_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildChatMessage" ADD CONSTRAINT "GuildChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentOpponent" ADD CONSTRAINT "RecentOpponent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentOpponent" ADD CONSTRAINT "RecentOpponent_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_challengedId_fkey" FOREIGN KEY ("challengedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
