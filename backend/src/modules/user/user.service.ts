import { PrismaClient } from '@prisma/client';
import { calculateCurrentStock } from '../chest/chest.service';
import { getNextLeagueThreshold } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      items: { where: { isEquipped: true } },
      chestState: true,
    },
  });
  if (!user) throw new Error('User not found');

  let chestStock = 0;
  let nextChestAt: string | null = null;

  if (user.chestState) {
    const state = calculateCurrentStock(user.chestState.stock, user.chestState.nextFreeAt);
    chestStock = state.stock;
    nextChestAt = state.stock < 5 ? state.nextFreeAt.toISOString() : null;
  }

  return {
    id: user.id,
    telegramId: user.telegramId,
    username: user.username,
    displayName: user.displayName,
    elo: user.elo,
    trophies: user.trophies,
    goldBalance: user.goldBalance,
    league: user.league,
    nextLeagueAt: getNextLeagueThreshold(user.league as any),
    gemBalance: user.gemBalance,
    createdAt: user.createdAt.toISOString(),
    equippedItems: user.items,
    chestStock,
    nextChestAt,
  };
}
