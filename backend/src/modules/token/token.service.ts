import { PrismaClient } from '@prisma/client';
import { TOKEN_CONSTANTS } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function withdrawGem(userId: string, amount: number) {
  if (amount < TOKEN_CONSTANTS.WITHDRAW_MIN) throw new Error(`Minimum ${TOKEN_CONSTANTS.WITHDRAW_MIN} GEM`);
  if (amount > TOKEN_CONSTANTS.WITHDRAW_MAX) throw new Error(`Maximum ${TOKEN_CONSTANTS.WITHDRAW_MAX} GEM`);

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error('No wallet connected');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.gemBalance < amount) throw new Error('Insufficient GEM balance');

  // Check cooldown
  const lastWithdraw = await prisma.tokenTransaction.findFirst({
    where: { userId, type: 'WITHDRAW', status: { in: ['PENDING', 'CONFIRMED'] } },
    orderBy: { createdAt: 'desc' },
  });
  if (lastWithdraw) {
    const cooldownEnd = new Date(lastWithdraw.createdAt.getTime() + TOKEN_CONSTANTS.WITHDRAW_COOLDOWN_HOURS * 3600000);
    if (new Date() < cooldownEnd) throw new Error('Withdrawal cooldown active (24h)');
  }

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { gemBalance: { decrement: amount } },
    });

    const transaction = await tx.tokenTransaction.create({
      data: {
        userId,
        type: 'WITHDRAW',
        amount,
        status: 'PENDING',
        walletAddress: wallet.address,
      },
    });

    // TODO: In production, trigger actual TON Jetton transfer here
    // For testnet, auto-confirm
    await tx.tokenTransaction.update({
      where: { id: transaction.id },
      data: { status: 'CONFIRMED', txHash: `testnet_${transaction.id}` },
    });

    return transaction;
  });
}

export async function confirmDeposit(userId: string, amount: number, txHash: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error('No wallet connected');

  // Check duplicate
  const existing = await prisma.tokenTransaction.findFirst({ where: { txHash } });
  if (existing) throw new Error('Transaction already processed');

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { gemBalance: { increment: amount } },
    });

    return tx.tokenTransaction.create({
      data: {
        userId,
        type: 'DEPOSIT',
        amount,
        status: 'CONFIRMED',
        txHash,
        walletAddress: wallet.address,
      },
    });
  });
}

export async function getTransactions(userId: string) {
  return prisma.tokenTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getTokenStats() {
  const totalBurned = await prisma.burnRecord.aggregate({ _sum: { amount: true } });
  const totalStaked = await prisma.stakePosition.aggregate({
    where: { claimedAt: null },
    _sum: { amount: true },
  });

  const burnBySource = await prisma.burnRecord.groupBy({
    by: ['source'],
    _sum: { amount: true },
  });

  const burned = totalBurned._sum.amount || 0;
  const staked = totalStaked._sum.amount || 0;

  return {
    totalSupply: TOKEN_CONSTANTS.TOTAL_SUPPLY,
    circulatingSupply: TOKEN_CONSTANTS.TOTAL_SUPPLY - burned - staked,
    totalBurned: burned,
    totalStaked: staked,
    burnBySource: Object.fromEntries(burnBySource.map(b => [b.source, b._sum.amount || 0])),
  };
}

export async function recordBurn(amount: number, source: 'MARKETPLACE' | 'SHOP' | 'BUYBACK') {
  return prisma.burnRecord.create({
    data: { amount, source },
  });
}
