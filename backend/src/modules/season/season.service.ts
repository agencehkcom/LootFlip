import { PrismaClient } from '@prisma/client';
import { League, LEAGUE_ORDER, getLeagueFromTrophies, getSeasonReward } from '@lootflip/shared';

const prisma = new PrismaClient();

function getWeekBounds(date: Date = new Date()): { weekStart: Date; weekEnd: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return { weekStart, weekEnd };
}

export async function getOrCreateCurrentSeason() {
  const { weekStart, weekEnd } = getWeekBounds();

  let season = await prisma.season.findUnique({
    where: { weekStart },
  });

  if (!season) {
    // Close any previous active season
    await closePreviousSeasons();

    season = await prisma.season.create({
      data: { weekStart, weekEnd, status: 'ACTIVE' },
    });
  }

  return season;
}

async function closePreviousSeasons() {
  const activeSasons = await prisma.season.findMany({
    where: { status: 'ACTIVE' },
  });

  for (const season of activeSasons) {
    if (season.weekEnd <= new Date()) {
      await distributSeasonRewards(season.id);
      await prisma.season.update({
        where: { id: season.id },
        data: { status: 'COMPLETED' },
      });
    }
  }
}

async function distributSeasonRewards(seasonId: string) {
  // For each league, rank players by trophies and assign rewards
  for (const league of LEAGUE_ORDER) {
    const players = await prisma.user.findMany({
      where: { league },
      orderBy: { trophies: 'desc' },
      take: 50,
      select: { id: true, trophies: true },
    });

    for (let i = 0; i < players.length; i++) {
      const rank = i + 1;
      const gemReward = getSeasonReward(league as any, rank);
      if (gemReward <= 0) continue;

      await prisma.seasonReward.upsert({
        where: {
          seasonId_userId: { seasonId, userId: players[i].id },
        },
        create: {
          seasonId,
          userId: players[i].id,
          league,
          rank,
          gemReward,
        },
        update: {
          league,
          rank,
          gemReward,
        },
      });
    }
  }
}

export async function getPlayerSeasonInfo(userId: string) {
  const season = await getOrCreateCurrentSeason();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trophies: true, league: true },
  });
  if (!user) throw new Error('User not found');

  // Get player rank within their league
  const higherCount = await prisma.user.count({
    where: {
      league: user.league,
      trophies: { gt: user.trophies },
    },
  });
  const rank = higherCount + 1;

  const potentialReward = getSeasonReward(user.league as any, rank);

  return {
    seasonId: season.id,
    weekStart: season.weekStart.toISOString(),
    weekEnd: season.weekEnd.toISOString(),
    league: user.league,
    rank,
    potentialReward,
  };
}

export async function getUnclaimedRewards(userId: string) {
  return prisma.seasonReward.findMany({
    where: { userId, claimedAt: null },
    include: { season: true },
    orderBy: { season: { weekStart: 'desc' } },
  });
}

export async function claimRewards(userId: string) {
  const unclaimed = await prisma.seasonReward.findMany({
    where: { userId, claimedAt: null },
  });

  if (unclaimed.length === 0) return { claimed: 0, totalGems: 0 };

  const totalGems = unclaimed.reduce((sum, r) => sum + r.gemReward, 0);

  await prisma.$transaction([
    ...unclaimed.map(r =>
      prisma.seasonReward.update({
        where: { id: r.id },
        data: { claimedAt: new Date() },
      })
    ),
    prisma.user.update({
      where: { id: userId },
      data: { gemBalance: { increment: totalGems } },
    }),
  ]);

  return { claimed: unclaimed.length, totalGems };
}
