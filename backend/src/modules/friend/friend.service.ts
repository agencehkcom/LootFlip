import { PrismaClient } from '@prisma/client';
import { FRIEND_CONSTANTS } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    include: {
      requester: { select: { id: true, username: true, displayName: true, elo: true, league: true } },
      receiver: { select: { id: true, username: true, displayName: true, elo: true, league: true } },
    },
  });

  return friendships.map(f => ({
    id: f.id,
    friend: f.requesterId === userId ? f.receiver : f.requester,
    createdAt: f.createdAt,
  }));
}

export async function getFriendRequests(userId: string) {
  return prisma.friendship.findMany({
    where: { receiverId: userId, status: 'PENDING' },
    include: {
      requester: { select: { id: true, username: true, displayName: true, elo: true, league: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function sendFriendRequest(requesterId: string, receiverId: string) {
  if (requesterId === receiverId) throw new Error('Cannot add yourself');

  // Check friend limit
  const friendCount = await prisma.friendship.count({
    where: {
      status: 'ACCEPTED',
      OR: [{ requesterId }, { receiverId: requesterId }],
    },
  });
  if (friendCount >= FRIEND_CONSTANTS.MAX_FRIENDS) throw new Error('Friend list full');

  // Check if already friends or pending
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    },
  });
  if (existing) {
    if (existing.status === 'ACCEPTED') throw new Error('Already friends');
    if (existing.status === 'PENDING') throw new Error('Request already pending');
    // If rejected, allow re-request by updating
    return prisma.friendship.update({
      where: { id: existing.id },
      data: { requesterId, receiverId, status: 'PENDING', createdAt: new Date() },
    });
  }

  return prisma.friendship.create({
    data: { requesterId, receiverId },
  });
}

export async function respondToFriendRequest(userId: string, friendshipId: string, accept: boolean) {
  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) throw new Error('Request not found');
  if (friendship.receiverId !== userId) throw new Error('Not your request');
  if (friendship.status !== 'PENDING') throw new Error('Request no longer pending');

  return prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
  });
}

export async function removeFriend(userId: string, friendshipId: string) {
  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) throw new Error('Friendship not found');
  if (friendship.requesterId !== userId && friendship.receiverId !== userId) {
    throw new Error('Not your friendship');
  }

  return prisma.friendship.delete({ where: { id: friendshipId } });
}

export async function getRecentOpponents(userId: string) {
  const recents = await prisma.recentOpponent.findMany({
    where: { userId },
    include: {
      opponent: { select: { id: true, username: true, displayName: true, elo: true, league: true } },
    },
    orderBy: { foughtAt: 'desc' },
    take: FRIEND_CONSTANTS.MAX_RECENT_OPPONENTS,
  });

  // Check which are already friends
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
  });
  const friendIds = new Set(friendships.map(f =>
    f.requesterId === userId ? f.receiverId : f.requesterId
  ));

  return recents.map(r => ({
    id: r.id,
    opponentId: r.opponentId,
    username: r.opponent.username,
    displayName: r.opponent.displayName,
    elo: r.opponent.elo,
    league: r.opponent.league,
    foughtAt: r.foughtAt,
    isFriend: friendIds.has(r.opponentId),
  }));
}

export async function addRecentOpponent(userId: string, opponentId: string, battleId: string) {
  if (userId === opponentId) return;

  await prisma.recentOpponent.upsert({
    where: { userId_opponentId: { userId, opponentId } },
    update: { battleId, foughtAt: new Date() },
    create: { userId, opponentId, battleId },
  });

  // Trim to max 20
  const all = await prisma.recentOpponent.findMany({
    where: { userId },
    orderBy: { foughtAt: 'desc' },
  });
  if (all.length > FRIEND_CONSTANTS.MAX_RECENT_OPPONENTS) {
    const toDelete = all.slice(FRIEND_CONSTANTS.MAX_RECENT_OPPONENTS);
    await prisma.recentOpponent.deleteMany({
      where: { id: { in: toDelete.map(r => r.id) } },
    });
  }
}
