import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { Action, GAME, EquippedItem } from '@lootflip/shared';
import {
  addToQueue, removeFromQueue, getQueue, findMatch,
} from './matchmaking.service';
import {
  createBattle, getBattle, saveBattle,
  submitAction, getRoundActions, clearRoundActions,
  resolveAndApply, persistBattleResult,
} from './battle.service';

const prisma = new PrismaClient();

const socketToUser = new Map<string, string>();
const userToSocket = new Map<string, string>();
const userToBattle = new Map<string, string>();

export function setupBattleSocket(io: Server) {
  io.on('connection', (socket) => {
    const userId = (socket as any).userId as string;
    if (!userId) return socket.disconnect();

    socketToUser.set(socket.id, userId);
    userToSocket.set(userId, socket.id);

    socket.on('matchmaking:join', async (data: { goldStake: number }) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { items: { where: { isEquipped: true } } },
      });
      if (!user) return;

      const equipment: EquippedItem[] = user.items.map(i => ({
        type: i.type, trait: i.trait, rarity: i.rarity, bonusDamage: i.bonusDamage,
      }));

      const entry = {
        userId, elo: user.elo, goldStake: data.goldStake,
        socketId: socket.id, joinedAt: Date.now(),
      };

      const match = findMatch(entry, getQueue(), GAME.ELO_MATCH_RANGE);

      if (match) {
        removeFromQueue(match.userId);

        const opponent = await prisma.user.findUnique({
          where: { id: match.userId },
          include: { items: { where: { isEquipped: true } } },
        });
        if (!opponent) return;

        const opEquipment: EquippedItem[] = opponent.items.map(i => ({
          type: i.type, trait: i.trait, rarity: i.rarity, bonusDamage: i.bonusDamage,
        }));

        const battle = await createBattle(
          userId, equipment,
          match.userId, opEquipment,
          data.goldStake
        );

        userToBattle.set(userId, battle.id);
        userToBattle.set(match.userId, battle.id);

        socket.join(battle.id);
        const matchSocket = io.sockets.sockets.get(match.socketId);
        matchSocket?.join(battle.id);

        socket.emit('matchmaking:found', {
          battleId: battle.id,
          opponent: { username: opponent.username, elo: opponent.elo, equipment: opEquipment },
        });
        matchSocket?.emit('matchmaking:found', {
          battleId: battle.id,
          opponent: { username: user.username, elo: user.elo, equipment },
        });

        io.to(battle.id).emit('round:start', {
          round: 1, timeLimit: GAME.ROUND_TIMER_SECONDS,
        });

        startRoundTimer(io, battle.id);
      } else {
        addToQueue(entry);
      }
    });

    socket.on('matchmaking:cancel', () => {
      removeFromQueue(userId);
    });

    socket.on('round:action', async (data: { action: Action; powerIndex: number | null }) => {
      const battleId = userToBattle.get(userId);
      if (!battleId) return;

      const { bothReady } = await submitAction(battleId, userId, {
        action: data.action, powerIndex: data.powerIndex,
      });

      if (bothReady) {
        await processRound(io, battleId);
      }
    });

    socket.on('disconnect', () => {
      removeFromQueue(userId);
      socketToUser.delete(socket.id);
      userToSocket.delete(userId);

      const battleId = userToBattle.get(userId);
      if (battleId) {
        socket.to(battleId).emit('opponent:disconnected');
      }
    });
  });
}

async function processRound(io: Server, battleId: string) {
  const battle = await getBattle(battleId);
  if (!battle || battle.status !== 'IN_PROGRESS') return;

  const actions = await getRoundActions(battleId);
  const p1Action = actions[battle.player1.userId] || randomAction();
  const p2Action = actions[battle.player2.userId] || randomAction();

  const { outcome, isOver } = resolveAndApply(battle, p1Action, p2Action);

  io.to(battleId).emit('round:result', {
    round: battle.currentRound - (isOver ? 0 : 1),
    p1Action: p1Action.action,
    p2Action: p2Action.action,
    p1Power: outcome.p1PowerActivated,
    p2Power: outcome.p2PowerActivated,
    p1Damage: outcome.p1Damage,
    p2Damage: outcome.p2Damage,
    p1Hp: battle.player1.hp,
    p2Hp: battle.player2.hp,
  });

  await clearRoundActions(battleId);

  if (isOver) {
    const { winnerId } = await persistBattleResult(battle, []);
    io.to(battleId).emit('battle:end', {
      battleId,
      winnerId,
      p1FinalHp: battle.player1.hp,
      p2FinalHp: battle.player2.hp,
      rounds: [],
      rewards: { gold: battle.goldStake, trophies: GAME.TROPHIES_WIN },
    });
    userToBattle.delete(battle.player1.userId);
    userToBattle.delete(battle.player2.userId);
  } else {
    await saveBattle(battle);
    io.to(battleId).emit('round:start', {
      round: battle.currentRound, timeLimit: GAME.ROUND_TIMER_SECONDS,
    });
    startRoundTimer(io, battleId);
  }
}

function startRoundTimer(io: Server, battleId: string) {
  setTimeout(async () => {
    const battle = await getBattle(battleId);
    if (!battle || battle.status !== 'IN_PROGRESS') return;

    const actions = await getRoundActions(battleId);
    const p1Submitted = !!actions[battle.player1.userId];
    const p2Submitted = !!actions[battle.player2.userId];

    if (!p1Submitted || !p2Submitted) {
      if (!p1Submitted) await submitAction(battleId, battle.player1.userId, randomAction());
      if (!p2Submitted) await submitAction(battleId, battle.player2.userId, randomAction());
      await processRound(io, battleId);
    }
  }, GAME.ROUND_TIMER_SECONDS * 1000);
}

function randomAction(): { action: Action; powerIndex: null } {
  const actions = Object.values(Action);
  return { action: actions[Math.floor(Math.random() * actions.length)], powerIndex: null };
}
