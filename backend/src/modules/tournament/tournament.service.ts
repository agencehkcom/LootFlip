import { PrismaClient } from '@prisma/client';
import { GUILD_CONSTANTS } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function declareWar(actorId: string, challengerGuildId: string, defenderGuildId: string) {
  const member = await prisma.guildMember.findUnique({ where: { userId: actorId } });
  if (!member || member.guildId !== challengerGuildId || member.role !== 'LEADER') {
    throw new Error('Only the guild leader can declare war');
  }
  if (challengerGuildId === defenderGuildId) throw new Error('Cannot declare war on yourself');

  // Check no active war
  const activeWar = await prisma.guildWar.findFirst({
    where: {
      status: { in: ['PENDING', 'ACTIVE'] },
      OR: [
        { challengerGuildId },
        { defenderGuildId: challengerGuildId },
      ],
    },
  });
  if (activeWar) throw new Error('Already in a war');

  return prisma.guildWar.create({
    data: { challengerGuildId, defenderGuildId },
    include: {
      challengerGuild: { select: { name: true } },
      defenderGuild: { select: { name: true } },
    },
  });
}

export async function respondToWar(actorId: string, warId: string, accept: boolean) {
  const war = await prisma.guildWar.findUnique({ where: { id: warId } });
  if (!war) throw new Error('War not found');
  if (war.status !== 'PENDING') throw new Error('War is not pending');

  const member = await prisma.guildMember.findUnique({ where: { userId: actorId } });
  if (!member || member.guildId !== war.defenderGuildId || member.role !== 'LEADER') {
    throw new Error('Only the defending guild leader can respond');
  }

  if (!accept) {
    return prisma.guildWar.update({ where: { id: warId }, data: { status: 'COMPLETED' } });
  }

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + GUILD_CONSTANTS.WAR_DURATION_HOURS * 3600000);

  return prisma.guildWar.update({
    where: { id: warId },
    data: { status: 'ACTIVE', startsAt, endsAt },
  });
}

export async function getWar(warId: string) {
  return prisma.guildWar.findUnique({
    where: { id: warId },
    include: {
      challengerGuild: { select: { name: true, trophies: true } },
      defenderGuild: { select: { name: true, trophies: true } },
    },
  });
}

export async function getActiveWarForGuild(guildId: string) {
  return prisma.guildWar.findFirst({
    where: {
      status: 'ACTIVE',
      OR: [{ challengerGuildId: guildId }, { defenderGuildId: guildId }],
    },
    include: {
      challengerGuild: { select: { name: true } },
      defenderGuild: { select: { name: true } },
    },
  });
}

export async function resolveWars() {
  const expiredWars = await prisma.guildWar.findMany({
    where: { status: 'ACTIVE', endsAt: { lt: new Date() } },
    include: {
      challengerGuild: { include: { members: true } },
      defenderGuild: { include: { members: true } },
    },
  });

  for (const war of expiredWars) {
    const winnerId = war.challengerWins > war.defenderWins
      ? war.challengerGuildId
      : war.defenderWins > war.challengerWins
        ? war.defenderGuildId
        : null; // Draw

    await prisma.$transaction(async (tx) => {
      await tx.guildWar.update({
        where: { id: war.id },
        data: { status: 'COMPLETED', winnerId },
      });

      if (winnerId) {
        await tx.guild.update({
          where: { id: winnerId },
          data: { trophies: { increment: GUILD_CONSTANTS.WAR_WINNER_TROPHIES } },
        });

        // Gold reward to winning members
        const winningMembers = winnerId === war.challengerGuildId
          ? war.challengerGuild.members
          : war.defenderGuild.members;

        for (const m of winningMembers) {
          await tx.user.update({
            where: { id: m.userId },
            data: { goldBalance: { increment: GUILD_CONSTANTS.WAR_PARTICIPANT_GOLD } },
          });
        }
      }
    });
  }

  // Expire pending wars not accepted within 24h
  const expiredPending = await prisma.guildWar.findMany({
    where: {
      status: 'PENDING',
      createdAt: { lt: new Date(Date.now() - GUILD_CONSTANTS.WAR_ACCEPT_TIMEOUT_HOURS * 3600000) },
    },
  });
  for (const war of expiredPending) {
    await prisma.guildWar.update({
      where: { id: war.id },
      data: { status: 'COMPLETED' },
    });
  }

  return expiredWars.length;
}

// Tournament
export async function getCurrentTournament() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);

  let tournament = await prisma.guildTournament.findUnique({ where: { weekStart } });
  if (!tournament) {
    tournament = await prisma.guildTournament.create({
      data: { weekStart, bracket: { guilds: [], rounds: [] } },
    });
  }
  return tournament;
}

export async function registerForTournament(actorId: string, guildId: string) {
  const member = await prisma.guildMember.findUnique({ where: { userId: actorId } });
  if (!member || member.guildId !== guildId || member.role !== 'LEADER') {
    throw new Error('Only the guild leader can register');
  }

  const guild = await prisma.guild.findUnique({ where: { id: guildId } });
  if (!guild) throw new Error('Guild not found');
  if (guild.goldTreasury < GUILD_CONSTANTS.TOURNAMENT_ENTRY_COST) {
    throw new Error('Not enough gold in treasury');
  }

  const tournament = await getCurrentTournament();
  if (tournament.status !== 'REGISTERING') throw new Error('Registration closed');

  const bracket = tournament.bracket as any;
  if (bracket.guilds.some((g: any) => g.id === guildId)) {
    throw new Error('Already registered');
  }

  // Deduct entry fee
  await prisma.guild.update({
    where: { id: guildId },
    data: { goldTreasury: { decrement: GUILD_CONSTANTS.TOURNAMENT_ENTRY_COST } },
  });

  bracket.guilds.push({ id: guildId, name: guild.name, trophies: guild.trophies });

  await prisma.guildTournament.update({
    where: { id: tournament.id },
    data: { bracket },
  });

  return tournament;
}
