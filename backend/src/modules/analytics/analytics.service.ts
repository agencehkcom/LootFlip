import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function trackEvent(userId: string | null, eventType: string, metadata?: Record<string, unknown>) {
  return prisma.analyticsEvent.create({
    data: { userId, eventType, metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined },
  });
}

export async function getStats() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 3600000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600000);

  const [totalUsers, dau, wau, mau, totalBattles, battlesToday] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastLoginAt: { gte: oneDayAgo } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
    prisma.battle.count(),
    prisma.battle.count({ where: { createdAt: { gte: oneDayAgo } } }),
  ]);

  // Event counts by type (last 24h)
  const recentEvents = await prisma.analyticsEvent.groupBy({
    by: ['eventType'],
    where: { createdAt: { gte: oneDayAgo } },
    _count: true,
  });

  return {
    totalUsers,
    dau,
    wau,
    mau,
    totalBattles,
    battlesToday,
    recentEvents: Object.fromEntries(recentEvents.map(e => [e.eventType, e._count])),
  };
}
