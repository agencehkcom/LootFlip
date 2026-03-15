import { PrismaClient } from '@prisma/client';
import { REFERRAL_BONUS, AIRDROP } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function getReferralInfo(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const totalReferred = await prisma.referral.count({ where: { referrerId: userId } });
  const totalBonusClaimed = await prisma.referral.count({ where: { referrerId: userId, bonusClaimed: true } });

  return {
    referralCode: user.referralCode,
    referralLink: `https://t.me/LootFlipBot?start=ref_${user.referralCode}`,
    totalReferred,
    totalBonusClaimed,
  };
}

export async function processReferral(referredUserId: string, referralCode: string) {
  const referrer = await prisma.user.findFirst({ where: { referralCode } });
  if (!referrer) return null;
  if (referrer.id === referredUserId) return null;

  // Check not already referred
  const existing = await prisma.referral.findUnique({ where: { referredId: referredUserId } });
  if (existing) return null;

  return prisma.$transaction(async (tx) => {
    // Create referral record
    const referral = await tx.referral.create({
      data: { referrerId: referrer.id, referredId: referredUserId },
    });

    // Update referred user
    await tx.user.update({
      where: { id: referredUserId },
      data: { referredBy: referrer.id },
    });

    // Bonus for both
    await tx.user.update({
      where: { id: referrer.id },
      data: { goldBalance: { increment: REFERRAL_BONUS.GOLD } },
    });
    await tx.user.update({
      where: { id: referredUserId },
      data: { goldBalance: { increment: REFERRAL_BONUS.GOLD } },
    });

    // Add chests to both
    for (const uid of [referrer.id, referredUserId]) {
      const cs = await tx.chestState.findUnique({ where: { userId: uid } });
      if (cs) {
        await tx.chestState.update({
          where: { userId: uid },
          data: { stock: { increment: REFERRAL_BONUS.CHESTS } },
        });
      }
    }

    return referral;
  });
}

export async function checkAirdropEligibility(userId: string): Promise<boolean> {
  const totalUsers = await prisma.user.count();
  if (totalUsers > AIRDROP.MAX_PLAYERS) return false;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;

  // Check if already received airdrop (simple: check if gemBalance includes airdrop)
  // We use an analytics event to track this
  const alreadyReceived = await prisma.analyticsEvent.findFirst({
    where: { userId, eventType: 'AIRDROP_CLAIMED' },
  });
  return !alreadyReceived;
}

export async function claimAirdrop(userId: string) {
  const eligible = await checkAirdropEligibility(userId);
  if (!eligible) throw new Error('Not eligible for airdrop');

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { gemBalance: { increment: AIRDROP.GEM_AMOUNT } },
    });

    await tx.analyticsEvent.create({
      data: { userId, eventType: 'AIRDROP_CLAIMED' },
    });

    return { amount: AIRDROP.GEM_AMOUNT };
  });
}
