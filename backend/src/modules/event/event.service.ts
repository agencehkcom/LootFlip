import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getActiveEvents() {
  const now = new Date();
  // Activate scheduled events that have started
  await prisma.gameEvent.updateMany({
    where: { status: 'SCHEDULED', startsAt: { lte: now } },
    data: { status: 'ACTIVE' },
  });
  // Complete expired events
  await prisma.gameEvent.updateMany({
    where: { status: 'ACTIVE', endsAt: { lte: now } },
    data: { status: 'COMPLETED' },
  });

  return prisma.gameEvent.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { endsAt: 'asc' },
  });
}

export async function getEventHistory() {
  return prisma.gameEvent.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { endsAt: 'desc' },
    take: 20,
  });
}

export async function getEvent(eventId: string) {
  const event = await prisma.gameEvent.findUnique({
    where: { id: eventId },
    include: {
      participations: {
        include: { user: { select: { username: true, displayName: true } } },
        orderBy: { score: 'desc' },
        take: 50,
      },
    },
  });
  return event;
}

export async function participate(userId: string, eventId: string) {
  const event = await prisma.gameEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new Error('Event not found');
  if (event.status !== 'ACTIVE') throw new Error('Event not active');

  return prisma.eventParticipation.upsert({
    where: { eventId_userId: { eventId, userId } },
    update: {},
    create: { eventId, userId },
  });
}

export async function updateScore(userId: string, eventId: string, scoreIncrement: number) {
  return prisma.eventParticipation.upsert({
    where: { eventId_userId: { eventId, userId } },
    update: { score: { increment: scoreIncrement } },
    create: { eventId, userId, score: scoreIncrement },
  });
}

export async function claimEventReward(userId: string, eventId: string) {
  const participation = await prisma.eventParticipation.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (!participation) throw new Error('Not participating');
  if (participation.rewardClaimed) throw new Error('Already claimed');

  const event = await prisma.gameEvent.findUnique({ where: { id: eventId } });
  if (!event || event.status !== 'COMPLETED') throw new Error('Event not completed');

  const config = event.config as any;
  const goldReward = config.goldReward || 100;
  const gemReward = config.gemReward || 5;

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        goldBalance: { increment: goldReward },
        gemBalance: { increment: gemReward },
      },
    });

    return tx.eventParticipation.update({
      where: { eventId_userId: { eventId, userId } },
      data: { rewardClaimed: true },
    });
  });
}

export async function seedEvents() {
  const count = await prisma.gameEvent.count();
  if (count > 0) return;

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600000);
  const in48h = new Date(now.getTime() + 48 * 3600000);
  const in72h = new Date(now.getTime() + 72 * 3600000);

  const events = [
    {
      type: 'DOUBLE_GOLD' as const,
      name: 'Fievre de l\'Or',
      description: 'Tous les combats rapportent 2x or pendant 24h !',
      config: { goldMultiplier: 2, goldReward: 200, gemReward: 10 },
      status: 'ACTIVE' as const,
      startsAt: now,
      endsAt: in24h,
    },
    {
      type: 'TRAIT_BOOST' as const,
      name: 'Semaine du Feu',
      description: 'Le trait BURN fait x2 degats pendant 48h !',
      config: { boostedTrait: 'BURN', damageMultiplier: 2, goldReward: 150, gemReward: 8 },
      status: 'SCHEDULED' as const,
      startsAt: in24h,
      endsAt: in72h,
    },
  ];

  await prisma.gameEvent.createMany({ data: events });
}
