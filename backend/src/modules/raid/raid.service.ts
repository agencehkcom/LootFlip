import { PrismaClient } from '@prisma/client';
import { RAID_CONSTANTS, GAME } from '@lootflip/shared';
import { resolveRound } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function getBosses() {
  return prisma.raidBoss.findMany({ orderBy: { name: 'asc' } });
}

export async function startRaid(userId: string, guildId: string, bossId: string, difficulty: 'NORMAL' | 'HEROIC' | 'MYTHIC') {
  const member = await prisma.guildMember.findUnique({ where: { userId } });
  if (!member || member.guildId !== guildId) throw new Error('Not in this guild');
  if (member.role === 'MEMBER') throw new Error('Officers+ can start raids');

  const activeRaid = await prisma.raid.findFirst({
    where: { guildId, status: 'ACTIVE' },
  });
  if (activeRaid) throw new Error('A raid is already active');

  const boss = await prisma.raidBoss.findUnique({ where: { id: bossId } });
  if (!boss) throw new Error('Boss not found');

  const hpMultiplier = RAID_CONSTANTS.HP_MULTIPLIER[difficulty];
  const totalHp = boss.maxHp * hpMultiplier;

  const endsAt = new Date();
  endsAt.setHours(endsAt.getHours() + RAID_CONSTANTS.DURATION_HOURS);

  return prisma.raid.create({
    data: {
      guildId,
      bossId,
      difficulty,
      currentHp: totalHp,
      endsAt,
    },
    include: { boss: true },
  });
}

export async function getActiveRaid(guildId: string) {
  return prisma.raid.findFirst({
    where: { guildId, status: 'ACTIVE' },
    include: {
      boss: true,
      attempts: {
        include: { user: { select: { username: true, displayName: true } } },
        orderBy: { damageDealt: 'desc' },
      },
    },
  });
}

export async function getRaid(raidId: string) {
  return prisma.raid.findUnique({
    where: { id: raidId },
    include: {
      boss: true,
      attempts: {
        include: { user: { select: { username: true, displayName: true } } },
        orderBy: { damageDealt: 'desc' },
      },
      rewards: true,
    },
  });
}

export async function attemptRaid(userId: string, raidId: string) {
  const raid = await prisma.raid.findUnique({
    where: { id: raidId },
    include: { boss: true },
  });
  if (!raid) throw new Error('Raid not found');
  if (raid.status !== 'ACTIVE') throw new Error('Raid not active');
  if (new Date() > raid.endsAt) throw new Error('Raid expired');

  const member = await prisma.guildMember.findUnique({ where: { userId } });
  if (!member || member.guildId !== raid.guildId) throw new Error('Not in this guild');

  const existingAttempts = await prisma.raidAttempt.count({
    where: { raidId, userId },
  });
  if (existingAttempts >= RAID_CONSTANTS.MAX_ATTEMPTS) throw new Error('No attempts left');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { items: { where: { isEquipped: true } } },
  });
  if (!user) throw new Error('User not found');

  // Simulate combat vs boss
  const mechanic = raid.boss.mechanic as any;
  const bossPattern = mechanic.pattern || ['ATTACK', 'DEFEND', 'SPELL', 'ATTACK', 'SPELL'];
  const roundsData: any[] = [];
  let totalDamage = 0;
  let playerHp = GAME.STARTING_HP;
  const prestigeBonus = 1 + (user.prestigeLevel * 0.05);

  for (let i = 0; i < RAID_CONSTANTS.ROUNDS_PER_ATTEMPT; i++) {
    if (playerHp <= 0) break;

    // Player makes optimal action (simplified: counter boss pattern)
    const bossAction = bossPattern[i % bossPattern.length];
    const playerAction = bossAction === 'ATTACK' ? 'DEFEND' : bossAction === 'DEFEND' ? 'SPELL' : 'ATTACK';

    // Calculate damage
    const baseDmg = GAME.BASE_DAMAGE;
    const equipBonus = user.items.reduce((sum, item) => sum + item.bonusDamage, 0);
    let roundDmg = Math.floor((baseDmg + equipBonus) * prestigeBonus);

    // Boss mechanic: element-based effects
    if (mechanic.doubleDamageElement && bossAction === 'ATTACK') {
      playerHp -= Math.floor(baseDmg * 1.5); // Boss hits harder
    } else if (bossAction === 'ATTACK') {
      playerHp -= baseDmg;
    }

    // Player wins round if they counter correctly
    const ACTION_BEATS: Record<string, string> = { ATTACK: 'SPELL', DEFEND: 'ATTACK', SPELL: 'DEFEND' };
    if (ACTION_BEATS[playerAction] === bossAction) {
      totalDamage += roundDmg;
    } else if (playerAction === bossAction) {
      totalDamage += Math.floor(roundDmg * 0.5); // Draw = half damage
    }

    roundsData.push({ round: i + 1, playerAction, bossAction, damage: roundDmg, playerHp });
  }

  return prisma.$transaction(async (tx) => {
    const attempt = await tx.raidAttempt.create({
      data: {
        raidId,
        userId,
        damageDealt: totalDamage,
        roundsData,
        attemptNumber: existingAttempts + 1,
      },
    });

    // Update raid HP
    const newHp = Math.max(0, raid.currentHp - totalDamage);
    const status = newHp <= 0 ? 'COMPLETED' : 'ACTIVE';

    await tx.raid.update({
      where: { id: raidId },
      data: { currentHp: newHp, status },
    });

    // If boss killed, create rewards for all participants
    if (status === 'COMPLETED') {
      const rewards = RAID_CONSTANTS.REWARDS[raid.difficulty];
      const participants = await tx.raidAttempt.findMany({
        where: { raidId },
        select: { userId: true },
        distinct: ['userId'],
      });

      for (const p of participants) {
        await tx.raidReward.create({
          data: {
            raidId,
            userId: p.userId,
            goldReward: rewards.gold,
            gemReward: rewards.gem,
          },
        });
      }
    }

    return { attempt, totalDamage, newHp, bossKilled: status === 'COMPLETED' };
  });
}

export async function claimRaidReward(userId: string, raidId: string) {
  const reward = await prisma.raidReward.findUnique({
    where: { raidId_userId: { raidId, userId } },
  });
  if (!reward) throw new Error('No reward found');
  if (reward.claimedAt) throw new Error('Already claimed');

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        goldBalance: { increment: reward.goldReward },
        gemBalance: { increment: reward.gemReward },
      },
    });

    return tx.raidReward.update({
      where: { id: reward.id },
      data: { claimedAt: new Date() },
    });
  });
}

export async function resolveExpiredRaids() {
  const expired = await prisma.raid.findMany({
    where: { status: 'ACTIVE', endsAt: { lt: new Date() } },
  });
  for (const raid of expired) {
    await prisma.raid.update({
      where: { id: raid.id },
      data: { status: 'FAILED' },
    });
  }
  return expired.length;
}

export async function seedBosses() {
  const count = await prisma.raidBoss.count();
  if (count > 0) return;

  const bosses = [
    { name: 'Inferno Dragon', description: 'Un dragon de feu aux attaques devastatrices', element: 'FIRE' as const, maxHp: 10000, mechanic: { pattern: ['ATTACK', 'ATTACK', 'SPELL', 'DEFEND', 'SPELL'], doubleDamageElement: true } },
    { name: 'Frost Titan', description: 'Un titan de glace qui gele ses adversaires', element: 'ICE' as const, maxHp: 12000, mechanic: { pattern: ['DEFEND', 'ATTACK', 'DEFEND', 'SPELL', 'ATTACK'], freezeChance: 0.3 } },
    { name: 'Thunder Colossus', description: 'Un colosse de foudre rapide et puissant', element: 'THUNDER' as const, maxHp: 8000, mechanic: { pattern: ['SPELL', 'ATTACK', 'SPELL', 'ATTACK', 'SPELL'], chainLightning: true } },
    { name: 'Shadow Wraith', description: 'Un spectre insaisissable qui se cache dans les ombres', element: 'SHADOW' as const, maxHp: 7000, mechanic: { pattern: ['DEFEND', 'DEFEND', 'SPELL', 'ATTACK', 'ATTACK'], invisibleRounds: [2, 4] } },
    { name: 'Plague Hydra', description: 'Une hydre venimeuse a trois tetes', element: 'POISON' as const, maxHp: 15000, mechanic: { pattern: ['ATTACK', 'SPELL', 'ATTACK', 'ATTACK', 'DEFEND'], poisonPerRound: 5 } },
    { name: 'Holy Guardian', description: 'Un gardien sacre protecteur des anciens', element: 'HOLY' as const, maxHp: 20000, mechanic: { pattern: ['DEFEND', 'DEFEND', 'DEFEND', 'SPELL', 'SPELL'], healPerRound: 500 } },
  ];

  await prisma.raidBoss.createMany({ data: bosses });
}
