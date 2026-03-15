import { PrismaClient } from '@prisma/client';
import { TOKEN_CONSTANTS } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function stake(userId: string, amount: number, lockDays: number) {
  const tier = TOKEN_CONSTANTS.STAKING_TIERS.find(t => t.lockDays === lockDays);
  if (!tier) throw new Error('Invalid lock period (7, 30, or 90 days)');
  if (amount <= 0) throw new Error('Amount must be positive');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.gemBalance < amount) throw new Error('Insufficient GEM balance');

  const unlocksAt = new Date();
  unlocksAt.setDate(unlocksAt.getDate() + lockDays);

  const rewardAmount = Math.floor(amount * tier.apy * lockDays / 365);

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { gemBalance: { decrement: amount } },
    });

    return tx.stakePosition.create({
      data: {
        userId,
        amount,
        lockDays,
        apy: tier.apy,
        unlocksAt,
        rewardAmount,
      },
    });
  });
}

export async function unstake(userId: string, positionId: string) {
  const position = await prisma.stakePosition.findUnique({ where: { id: positionId } });
  if (!position) throw new Error('Position not found');
  if (position.userId !== userId) throw new Error('Not your position');
  if (position.claimedAt) throw new Error('Already claimed');
  if (new Date() < position.unlocksAt) throw new Error('Position still locked');

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { gemBalance: { increment: position.amount } },
    });

    return tx.stakePosition.update({
      where: { id: positionId },
      data: { claimedAt: new Date() },
    });
  });
}

export async function claimRewards(userId: string, positionId: string) {
  const position = await prisma.stakePosition.findUnique({ where: { id: positionId } });
  if (!position) throw new Error('Position not found');
  if (position.userId !== userId) throw new Error('Not your position');
  if (position.claimedAt) throw new Error('Already claimed');
  if (new Date() < position.unlocksAt) throw new Error('Position still locked');

  return prisma.$transaction(async (tx) => {
    // Return stake + rewards
    await tx.user.update({
      where: { id: userId },
      data: { gemBalance: { increment: position.amount + position.rewardAmount } },
    });

    return tx.stakePosition.update({
      where: { id: positionId },
      data: { claimedAt: new Date() },
    });
  });
}

export async function getPositions(userId: string) {
  const positions = await prisma.stakePosition.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
  });

  return positions.map(p => ({
    ...p,
    isUnlocked: new Date() >= p.unlocksAt,
  }));
}

export async function getStakingInfo() {
  const totalStaked = await prisma.stakePosition.aggregate({
    where: { claimedAt: null },
    _sum: { amount: true },
  });

  const positionsByTier = await prisma.stakePosition.groupBy({
    by: ['lockDays'],
    where: { claimedAt: null },
    _sum: { amount: true },
    _count: true,
  });

  return {
    totalStaked: totalStaked._sum.amount || 0,
    tiers: TOKEN_CONSTANTS.STAKING_TIERS.map(tier => {
      const tierData = positionsByTier.find(p => p.lockDays === tier.lockDays);
      return {
        lockDays: tier.lockDays,
        apy: tier.apy * 100,
        totalStaked: tierData?._sum.amount || 0,
        positionsCount: tierData?._count || 0,
      };
    }),
  };
}

export async function getUserStakingPower(userId: string): Promise<number> {
  const result = await prisma.stakePosition.aggregate({
    where: { userId, claimedAt: null },
    _sum: { amount: true },
  });
  return result._sum.amount || 0;
}
