-- CreateEnum
CREATE TYPE "League" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND', 'LEGEND');

-- CreateEnum
CREATE TYPE "SeasonStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "Battle" ADD COLUMN     "eloChange" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isBotMatch" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "league" "League" NOT NULL DEFAULT 'BRONZE';

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "status" "SeasonStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonReward" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "league" "League" NOT NULL,
    "rank" INTEGER NOT NULL,
    "gemReward" INTEGER NOT NULL,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "SeasonReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Season_weekStart_key" ON "Season"("weekStart");

-- CreateIndex
CREATE INDEX "SeasonReward_userId_idx" ON "SeasonReward"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonReward_seasonId_userId_key" ON "SeasonReward"("seasonId", "userId");

-- AddForeignKey
ALTER TABLE "SeasonReward" ADD CONSTRAINT "SeasonReward_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonReward" ADD CONSTRAINT "SeasonReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
