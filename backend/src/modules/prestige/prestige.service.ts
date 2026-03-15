import { PrismaClient } from '@prisma/client';
import { PRESTIGE_CONSTANTS } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function getPrestigeInfo(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const canPrestige = user.trophies >= PRESTIGE_CONSTANTS.MIN_TROPHIES &&
                      user.prestigeLevel < PRESTIGE_CONSTANTS.MAX_LEVEL;

  return {
    currentLevel: user.prestigeLevel,
    maxLevel: PRESTIGE_CONSTANTS.MAX_LEVEL,
    currentBonus: user.prestigeLevel * PRESTIGE_CONSTANTS.DAMAGE_BONUS_PER_LEVEL * 100,
    nextBonus: (user.prestigeLevel + 1) * PRESTIGE_CONSTANTS.DAMAGE_BONUS_PER_LEVEL * 100,
    canPrestige,
    requirements: {
      minTrophies: PRESTIGE_CONSTANTS.MIN_TROPHIES,
      currentTrophies: user.trophies,
    },
  };
}

export async function activatePrestige(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.trophies < PRESTIGE_CONSTANTS.MIN_TROPHIES) {
    throw new Error(`Need ${PRESTIGE_CONSTANTS.MIN_TROPHIES}+ trophies`);
  }
  if (user.prestigeLevel >= PRESTIGE_CONSTANTS.MAX_LEVEL) {
    throw new Error('Already max prestige');
  }

  return prisma.$transaction(async (tx) => {
    // Delete all items (keep equipped flag doesn't matter)
    await tx.item.deleteMany({ where: { ownerId: userId } });

    // Reset gold, increment prestige
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        goldBalance: 0,
        prestigeLevel: { increment: 1 },
      },
    });

    // Give 3 starter chests
    await tx.chestState.upsert({
      where: { userId },
      update: { stock: 3, nextFreeAt: new Date() },
      create: { userId, stock: 3, nextFreeAt: new Date() },
    });

    return {
      newLevel: updated.prestigeLevel,
      damageBonus: updated.prestigeLevel * PRESTIGE_CONSTANTS.DAMAGE_BONUS_PER_LEVEL * 100,
    };
  });
}
