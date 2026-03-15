import { PrismaClient } from '@prisma/client';
import { GUILD_CONSTANTS, ROLE_HIERARCHY, GuildRole } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function createGuild(userId: string, name: string, description: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.goldBalance < GUILD_CONSTANTS.CREATION_COST) throw new Error('Not enough gold (500 required)');

  const existing = await prisma.guildMember.findUnique({ where: { userId } });
  if (existing) throw new Error('Already in a guild');

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { goldBalance: { decrement: GUILD_CONSTANTS.CREATION_COST } },
    });

    const guild = await tx.guild.create({
      data: {
        name,
        description,
        leaderId: userId,
        members: { create: { userId, role: 'LEADER' } },
      },
      include: { members: { include: { user: true } } },
    });

    return guild;
  });
}

export async function getGuild(guildId: string) {
  return prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      members: {
        include: { user: { select: { id: true, username: true, displayName: true, elo: true, league: true } } },
        orderBy: { role: 'asc' },
      },
      announcements: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
}

export async function joinGuild(userId: string, guildId: string) {
  const existing = await prisma.guildMember.findUnique({ where: { userId } });
  if (existing) throw new Error('Already in a guild');

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: { _count: { select: { members: true } } },
  });
  if (!guild) throw new Error('Guild not found');
  if (guild._count.members >= GUILD_CONSTANTS.MAX_MEMBERS) throw new Error('Guild is full');

  return prisma.guildMember.create({
    data: { guildId, userId, role: 'MEMBER' },
  });
}

export async function leaveGuild(userId: string) {
  const member = await prisma.guildMember.findUnique({
    where: { userId },
    include: { guild: { include: { members: { orderBy: { joinedAt: 'asc' } } } } },
  });
  if (!member) throw new Error('Not in a guild');

  return prisma.$transaction(async (tx) => {
    await tx.guildMember.delete({ where: { userId } });

    // If leader leaving, transfer leadership
    if (member.role === 'LEADER') {
      const remaining = member.guild.members.filter(m => m.userId !== userId);
      if (remaining.length === 0) {
        // Dissolve guild — redistribute treasury
        await tx.guild.delete({ where: { id: member.guildId } });
        return { dissolved: true };
      }

      // Find successor: CO_LEADER > OFFICER > MEMBER (oldest)
      const successor =
        remaining.find(m => m.role === 'CO_LEADER') ||
        remaining.find(m => m.role === 'OFFICER') ||
        remaining[0];

      await tx.guildMember.update({
        where: { id: successor.id },
        data: { role: 'LEADER' },
      });
      await tx.guild.update({
        where: { id: member.guildId },
        data: { leaderId: successor.userId },
      });
    }

    return { dissolved: false };
  });
}

export async function kickMember(actorId: string, targetUserId: string) {
  const actor = await prisma.guildMember.findUnique({ where: { userId: actorId } });
  const target = await prisma.guildMember.findUnique({ where: { userId: targetUserId } });
  if (!actor || !target) throw new Error('Member not found');
  if (actor.guildId !== target.guildId) throw new Error('Not in the same guild');

  const actorRank = ROLE_HIERARCHY[actor.role as GuildRole];
  const targetRank = ROLE_HIERARCHY[target.role as GuildRole];
  if (actorRank <= targetRank) throw new Error('Insufficient permissions');
  if (actorRank < ROLE_HIERARCHY[GuildRole.OFFICER]) throw new Error('Must be Officer or above');

  return prisma.guildMember.delete({ where: { userId: targetUserId } });
}

export async function promoteMember(actorId: string, targetUserId: string) {
  const actor = await prisma.guildMember.findUnique({ where: { userId: actorId } });
  const target = await prisma.guildMember.findUnique({ where: { userId: targetUserId } });
  if (!actor || !target) throw new Error('Member not found');
  if (actor.guildId !== target.guildId) throw new Error('Not in the same guild');

  const actorRank = ROLE_HIERARCHY[actor.role as GuildRole];
  if (actorRank < ROLE_HIERARCHY[GuildRole.CO_LEADER]) throw new Error('Must be Co-Leader or Leader');

  const roles: GuildRole[] = [GuildRole.MEMBER, GuildRole.OFFICER, GuildRole.CO_LEADER];
  const currentIdx = roles.indexOf(target.role as GuildRole);
  if (currentIdx === -1 || currentIdx >= roles.length - 1) throw new Error('Cannot promote further');

  const newRole = roles[currentIdx + 1];
  return prisma.guildMember.update({
    where: { userId: targetUserId },
    data: { role: newRole },
  });
}

export async function demoteMember(actorId: string, targetUserId: string) {
  const actor = await prisma.guildMember.findUnique({ where: { userId: actorId } });
  const target = await prisma.guildMember.findUnique({ where: { userId: targetUserId } });
  if (!actor || !target) throw new Error('Member not found');
  if (actor.guildId !== target.guildId) throw new Error('Not in the same guild');

  const actorRank = ROLE_HIERARCHY[actor.role as GuildRole];
  const targetRank = ROLE_HIERARCHY[target.role as GuildRole];
  if (actorRank <= targetRank) throw new Error('Insufficient permissions');

  const roles: GuildRole[] = [GuildRole.MEMBER, GuildRole.OFFICER, GuildRole.CO_LEADER];
  const currentIdx = roles.indexOf(target.role as GuildRole);
  if (currentIdx <= 0) throw new Error('Cannot demote further');

  const newRole = roles[currentIdx - 1];
  return prisma.guildMember.update({
    where: { userId: targetUserId },
    data: { role: newRole },
  });
}

export async function donate(userId: string, guildId: string, goldAmount: number, gemAmount: number, itemId?: string) {
  const member = await prisma.guildMember.findUnique({ where: { userId } });
  if (!member || member.guildId !== guildId) throw new Error('Not a member of this guild');

  // Check cooldown
  const lastDonation = await prisma.guildDonation.findFirst({
    where: { userId, guildId },
    orderBy: { createdAt: 'desc' },
  });
  if (lastDonation) {
    const cooldownEnd = new Date(lastDonation.createdAt.getTime() + GUILD_CONSTANTS.DONATION_COOLDOWN_HOURS * 3600000);
    if (new Date() < cooldownEnd) throw new Error('Donation cooldown active');
  }

  if (goldAmount > GUILD_CONSTANTS.DONATION_MAX_GOLD) throw new Error(`Max ${GUILD_CONSTANTS.DONATION_MAX_GOLD} gold per donation`);
  if (gemAmount > GUILD_CONSTANTS.DONATION_MAX_GEM) throw new Error(`Max ${GUILD_CONSTANTS.DONATION_MAX_GEM} gems per donation`);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.goldBalance < goldAmount) throw new Error('Not enough gold');
    if (user.gemBalance < gemAmount) throw new Error('Not enough gems');

    // Debit user
    await tx.user.update({
      where: { id: userId },
      data: {
        goldBalance: { decrement: goldAmount },
        gemBalance: { decrement: gemAmount },
      },
    });

    // Credit guild treasury
    await tx.guild.update({
      where: { id: guildId },
      data: {
        goldTreasury: { increment: goldAmount },
        gemTreasury: { increment: gemAmount },
      },
    });

    // Handle item donation
    if (itemId) {
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item || item.ownerId !== userId) throw new Error('Item not found');
      if (item.isEquipped || item.isListed) throw new Error('Item must be unequipped and unlisted');

      await tx.item.update({
        where: { id: itemId },
        data: { guildId, ownerId: userId },
      });
    }

    return tx.guildDonation.create({
      data: { guildId, userId, goldAmount, gemAmount, itemId },
    });
  });
}

export async function searchGuilds(query: string) {
  return prisma.guild.findMany({
    where: query ? { name: { contains: query, mode: 'insensitive' } } : {},
    include: { _count: { select: { members: true } } },
    orderBy: { trophies: 'desc' },
    take: 20,
  });
}

export async function getGuildLeaderboard() {
  return prisma.guild.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { trophies: 'desc' },
    take: 50,
  });
}

export async function postAnnouncement(userId: string, guildId: string, content: string, isPinned: boolean = false) {
  const member = await prisma.guildMember.findUnique({ where: { userId } });
  if (!member || member.guildId !== guildId) throw new Error('Not a member');
  if (ROLE_HIERARCHY[member.role as GuildRole] < ROLE_HIERARCHY[GuildRole.OFFICER]) {
    throw new Error('Must be Officer or above');
  }

  return prisma.guildAnnouncement.create({
    data: { guildId, authorId: userId, content, isPinned },
  });
}

export async function togglePinAnnouncement(userId: string, announcementId: string) {
  const announcement = await prisma.guildAnnouncement.findUnique({ where: { id: announcementId } });
  if (!announcement) throw new Error('Announcement not found');

  const member = await prisma.guildMember.findUnique({ where: { userId } });
  if (!member || member.guildId !== announcement.guildId) throw new Error('Not a member');
  if (ROLE_HIERARCHY[member.role as GuildRole] < ROLE_HIERARCHY[GuildRole.OFFICER]) {
    throw new Error('Must be Officer or above');
  }

  return prisma.guildAnnouncement.update({
    where: { id: announcementId },
    data: { isPinned: !announcement.isPinned },
  });
}

export async function deleteAnnouncement(userId: string, announcementId: string) {
  const announcement = await prisma.guildAnnouncement.findUnique({ where: { id: announcementId } });
  if (!announcement) throw new Error('Announcement not found');

  const member = await prisma.guildMember.findUnique({ where: { userId } });
  if (!member || member.guildId !== announcement.guildId) throw new Error('Not a member');
  if (ROLE_HIERARCHY[member.role as GuildRole] < ROLE_HIERARCHY[GuildRole.OFFICER]) {
    throw new Error('Must be Officer or above');
  }

  return prisma.guildAnnouncement.delete({ where: { id: announcementId } });
}

export async function getUserGuild(userId: string) {
  const member = await prisma.guildMember.findUnique({
    where: { userId },
    include: {
      guild: {
        include: {
          members: {
            include: { user: { select: { id: true, username: true, displayName: true, elo: true, league: true } } },
            orderBy: { role: 'asc' },
          },
          announcements: { orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }], take: 20 },
        },
      },
    },
  });
  return member;
}
