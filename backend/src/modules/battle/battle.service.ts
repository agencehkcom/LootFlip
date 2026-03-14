import { redis } from '../../config/redis';
import { PrismaClient } from '@prisma/client';
import {
  BattleState, RoundAction, EquippedItem,
  GAME, resolveRound, determineWinner,
} from '@lootflip/shared';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

export async function createBattle(
  p1Id: string, p1Equipment: EquippedItem[],
  p2Id: string, p2Equipment: EquippedItem[],
  goldStake: number
): Promise<BattleState> {
  const battle: BattleState = {
    id: uuid(),
    player1: {
      userId: p1Id, hp: GAME.STARTING_HP,
      equipment: p1Equipment,
      powersUsed: [false, false, false],
      connected: true,
    },
    player2: {
      userId: p2Id, hp: GAME.STARTING_HP,
      equipment: p2Equipment,
      powersUsed: [false, false, false],
      connected: true,
    },
    currentRound: 1,
    status: 'IN_PROGRESS',
    goldStake,
  };

  await redis.setex(`battle:${battle.id}`, 300, JSON.stringify(battle));
  return battle;
}

export async function getBattle(battleId: string): Promise<BattleState | null> {
  const data = await redis.get(`battle:${battleId}`);
  return data ? JSON.parse(data) : null;
}

export async function saveBattle(battle: BattleState): Promise<void> {
  await redis.setex(`battle:${battle.id}`, 300, JSON.stringify(battle));
}

export async function submitAction(
  battleId: string, userId: string, action: RoundAction
): Promise<{ bothReady: boolean }> {
  const key = `battle:${battleId}:round:actions`;
  await redis.hset(key, userId, JSON.stringify(action));
  await redis.expire(key, 30);
  const actions = await redis.hgetall(key);
  return { bothReady: Object.keys(actions).length >= 2 };
}

export async function getRoundActions(battleId: string): Promise<Record<string, RoundAction>> {
  const key = `battle:${battleId}:round:actions`;
  const raw = await redis.hgetall(key);
  const result: Record<string, RoundAction> = {};
  for (const [userId, data] of Object.entries(raw)) {
    result[userId] = JSON.parse(data);
  }
  return result;
}

export async function clearRoundActions(battleId: string): Promise<void> {
  await redis.del(`battle:${battleId}:round:actions`);
}

export function resolveAndApply(
  battle: BattleState,
  p1Action: RoundAction,
  p2Action: RoundAction
) {
  const outcome = resolveRound(p1Action, p2Action, {
    p1Equipment: battle.player1.equipment,
    p2Equipment: battle.player2.equipment,
    p1PowersUsed: battle.player1.powersUsed,
    p2PowersUsed: battle.player2.powersUsed,
  });

  battle.player1.hp = Math.max(0, battle.player1.hp - outcome.p1Damage + outcome.p1Heal);
  battle.player2.hp = Math.max(0, battle.player2.hp - outcome.p2Damage + outcome.p2Heal);

  battle.player1.hp = Math.min(battle.player1.hp, GAME.STARTING_HP);
  battle.player2.hp = Math.min(battle.player2.hp, GAME.STARTING_HP);

  if (outcome.p1PowerActivated !== null) battle.player1.powersUsed[outcome.p1PowerActivated] = true;
  if (outcome.p2PowerActivated !== null) battle.player2.powersUsed[outcome.p2PowerActivated] = true;

  const isOver = battle.player1.hp <= 0 || battle.player2.hp <= 0 || battle.currentRound >= GAME.MAX_ROUNDS;

  if (isOver) {
    battle.status = 'FINISHED';
  } else {
    battle.currentRound++;
  }

  return { outcome, isOver };
}

export async function persistBattleResult(
  battle: BattleState,
  roundsData: any[]
) {
  const winner = determineWinner(battle.player1.hp, battle.player2.hp);
  const winnerId = winner === 'p1' ? battle.player1.userId
    : winner === 'p2' ? battle.player2.userId
    : null;

  await prisma.battle.create({
    data: {
      id: battle.id,
      player1Id: battle.player1.userId,
      player2Id: battle.player2.userId,
      winnerId,
      mode: 'RANKED',
      goldStake: battle.goldStake,
      roundsData: roundsData,
    },
  });

  if (winnerId) {
    const loserId = winnerId === battle.player1.userId
      ? battle.player2.userId : battle.player1.userId;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: winnerId },
        data: {
          trophies: { increment: GAME.TROPHIES_WIN },
          goldBalance: { increment: battle.goldStake },
        },
      }),
      prisma.user.update({
        where: { id: loserId },
        data: {
          trophies: { decrement: GAME.TROPHIES_LOSE },
          goldBalance: { decrement: battle.goldStake },
        },
      }),
    ]);
  }

  await redis.del(`battle:${battle.id}`);

  return { winnerId };
}
