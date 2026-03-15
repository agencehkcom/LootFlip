import { PrismaClient } from '@prisma/client';
import { FRIEND_CONSTANTS } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function sendChallenge(challengerId: string, challengedId: string, goldStake: number) {
  if (challengerId === challengedId) throw new Error('Cannot challenge yourself');
  if (goldStake < 0) throw new Error('Invalid stake');

  // Verify friendship
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { requesterId: challengerId, receiverId: challengedId },
        { requesterId: challengedId, receiverId: challengerId },
      ],
    },
  });
  if (!friendship) throw new Error('Must be friends to challenge');

  // Check balance
  const challenger = await prisma.user.findUnique({ where: { id: challengerId } });
  if (!challenger || challenger.goldBalance < goldStake) throw new Error('Not enough gold');

  // Check no pending challenge between these two
  const existing = await prisma.challenge.findFirst({
    where: {
      status: 'PENDING',
      OR: [
        { challengerId, challengedId },
        { challengerId: challengedId, challengedId: challengerId },
      ],
    },
  });
  if (existing) throw new Error('Challenge already pending');

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + FRIEND_CONSTANTS.CHALLENGE_EXPIRE_MINUTES);

  return prisma.challenge.create({
    data: { challengerId, challengedId, goldStake, expiresAt },
    include: {
      challenger: { select: { username: true, displayName: true } },
      challenged: { select: { username: true, displayName: true } },
    },
  });
}

export async function respondToChallenge(userId: string, challengeId: string, accept: boolean) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) throw new Error('Challenge not found');
  if (challenge.challengedId !== userId) throw new Error('Not your challenge');
  if (challenge.status !== 'PENDING') throw new Error('Challenge no longer pending');
  if (new Date() > challenge.expiresAt) {
    await prisma.challenge.update({ where: { id: challengeId }, data: { status: 'DECLINED' } });
    throw new Error('Challenge expired');
  }

  if (!accept) {
    return prisma.challenge.update({
      where: { id: challengeId },
      data: { status: 'DECLINED' },
    });
  }

  // Verify both players have enough gold
  const [challenger, challenged] = await Promise.all([
    prisma.user.findUnique({ where: { id: challenge.challengerId } }),
    prisma.user.findUnique({ where: { id: challenge.challengedId } }),
  ]);

  if (!challenger || challenger.goldBalance < challenge.goldStake) {
    await prisma.challenge.update({ where: { id: challengeId }, data: { status: 'DECLINED' } });
    throw new Error('Challenger no longer has enough gold');
  }
  if (!challenged || challenged.goldBalance < challenge.goldStake) {
    throw new Error('Not enough gold');
  }

  return prisma.challenge.update({
    where: { id: challengeId },
    data: { status: 'ACCEPTED' },
  });
}

export async function getPendingChallenges(userId: string) {
  return prisma.challenge.findMany({
    where: {
      status: 'PENDING',
      OR: [{ challengerId: userId }, { challengedId: userId }],
      expiresAt: { gt: new Date() },
    },
    include: {
      challenger: { select: { id: true, username: true, displayName: true } },
      challenged: { select: { id: true, username: true, displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function expireChallenges() {
  return prisma.challenge.updateMany({
    where: { status: 'PENDING', expiresAt: { lt: new Date() } },
    data: { status: 'DECLINED' },
  });
}
