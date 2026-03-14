import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import {
  Action, GAME, EquippedItem,
  getLeagueFromTrophies, LEAGUE_GOLD_STAKES,
} from '@lootflip/shared';
import {
  addToQueue, removeFromQueue, getQueue, findMatch,
} from './matchmaking.service';
import {
  createBattle, getBattle, saveBattle,
  submitAction, getRoundActions, clearRoundActions,
  resolveAndApply, persistBattleResult,
} from './battle.service';
import { generateBotProfile, botChooseAction, getBotResponseDelay } from './bot.service';

const prisma = new PrismaClient();

const socketToUser = new Map<string, string>();
const userToSocket = new Map<string, string>();
const userToBattle = new Map<string, string>();
const battleBotState = new Map<string, { previousAction: Action | null }>();
const matchmakingTimers = new Map<string, NodeJS.Timeout>();

export function setupBattleSocket(io: Server) {
  io.on('connection', (socket) => {
    const userId = (socket as any).userId as string;
    if (!userId) return socket.disconnect();

    socketToUser.set(socket.id, userId);
    userToSocket.set(userId, socket.id);

    socket.on('matchmaking:join', async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { items: { where: { isEquipped: true } } },
      });
      if (!user) return;

      const league = getLeagueFromTrophies(user.trophies);
      const goldStake = user.goldBalance >= LEAGUE_GOLD_STAKES[league]
        ? LEAGUE_GOLD_STAKES[league] : 0;

      const equipment: EquippedItem[] = user.items.map(i => ({
        type: i.type, trait: i.trait, rarity: i.rarity, bonusDamage: i.bonusDamage,
      }));

      const entry = {
        userId, elo: user.elo, goldStake,
        socketId: socket.id, joinedAt: Date.now(),
      };

      const match = findMatch(entry, getQueue(), GAME.ELO_MATCH_RANGE);

      if (match) {
        removeFromQueue(match.userId);
        await startPvPBattle(io, socket, userId, user, equipment, match, goldStake);
      } else {
        addToQueue(entry);
        // Start bot fallback timer
        const timer = setTimeout(async () => {
          const removed = removeFromQueue(userId);
          if (removed) {
            await startBotBattle(io, socket, userId, user, equipment, goldStake);
          }
        }, GAME.BOT_FALLBACK_TIMEOUT_MS);
        matchmakingTimers.set(userId, timer);
      }
    });

    socket.on('matchmaking:cancel', () => {
      removeFromQueue(userId);
      clearMatchmakingTimer(userId);
    });

    socket.on('round:action', async (data: { action: Action; powerIndex: number | null }) => {
      const battleId = userToBattle.get(userId);
      if (!battleId) return;

      const { bothReady } = await submitAction(battleId, userId, {
        action: data.action, powerIndex: data.powerIndex,
      });

      // If bot match, schedule bot action
      const botState = battleBotState.get(battleId);
      if (botState) {
        const battle = await getBattle(battleId);
        if (!battle) return;

        const botPlayer = battle.player2;
        const delay = getBotResponseDelay();

        setTimeout(async () => {
          const botAction = botChooseAction(
            botState.previousAction,
            botPlayer.powersUsed,
            botPlayer.equipment,
            botPlayer.hp
          );
          botState.previousAction = botAction.action;

          await submitAction(battleId, botPlayer.userId, botAction);
          await processRound(io, battleId);
        }, delay);
      } else if (bothReady) {
        await processRound(io, battleId);
      }
    });

    socket.on('disconnect', () => {
      removeFromQueue(userId);
      clearMatchmakingTimer(userId);
      socketToUser.delete(socket.id);
      userToSocket.delete(userId);

      const battleId = userToBattle.get(userId);
      if (battleId) {
        socket.to(battleId).emit('opponent:disconnected');
      }
    });
  });
}

async function startPvPBattle(
  io: Server, socket: any,
  userId: string, user: any, equipment: EquippedItem[],
  match: any, goldStake: number
) {
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
    goldStake
  );

  userToBattle.set(userId, battle.id);
  userToBattle.set(match.userId, battle.id);

  socket.join(battle.id);
  const matchSocket = io.sockets.sockets.get(match.socketId);
  matchSocket?.join(battle.id);

  clearMatchmakingTimer(match.userId);

  const league = getLeagueFromTrophies(user.trophies);

  socket.emit('matchmaking:found', {
    battleId: battle.id,
    opponent: { username: opponent.username, elo: opponent.elo, equipment: opEquipment },
    goldStake, league, isBotMatch: false,
  });
  matchSocket?.emit('matchmaking:found', {
    battleId: battle.id,
    opponent: { username: user.username, elo: user.elo, equipment },
    goldStake, league: getLeagueFromTrophies(opponent.trophies), isBotMatch: false,
  });

  io.to(battle.id).emit('round:start', {
    round: 1, timeLimit: GAME.ROUND_TIMER_SECONDS,
  });

  startRoundTimer(io, battle.id);
}

async function startBotBattle(
  io: Server, socket: any,
  userId: string, user: any, equipment: EquippedItem[],
  goldStake: number
) {
  const bot = generateBotProfile(user.elo);
  const botGoldStake = Math.floor(goldStake * GAME.BOT_GOLD_MULTIPLIER);

  const battle = await createBattle(
    userId, equipment,
    bot.odId, bot.equipment,
    botGoldStake
  );

  userToBattle.set(userId, battle.id);
  battleBotState.set(battle.id, { previousAction: null });

  socket.join(battle.id);

  const league = getLeagueFromTrophies(user.trophies);

  socket.emit('matchmaking:found', {
    battleId: battle.id,
    opponent: { username: bot.username, elo: bot.elo, equipment: bot.equipment },
    goldStake: botGoldStake, league, isBotMatch: true,
  });

  io.to(battle.id).emit('round:start', {
    round: 1, timeLimit: GAME.ROUND_TIMER_SECONDS,
  });

  // No round timer needed for bot — bot responds after player
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
    const isBotMatch = battleBotState.has(battleId);
    const { winnerId, eloChange } = await persistBattleResult(
      battle, [], isBotMatch,
      undefined, undefined
    );

    io.to(battleId).emit('battle:end', {
      battleId,
      winnerId,
      p1FinalHp: battle.player1.hp,
      p2FinalHp: battle.player2.hp,
      rounds: [],
      rewards: { gold: battle.goldStake, trophies: isBotMatch ? 0 : Math.abs(eloChange) },
      eloChange: isBotMatch ? 0 : eloChange,
      isBotMatch,
    });

    userToBattle.delete(battle.player1.userId);
    userToBattle.delete(battle.player2.userId);
    battleBotState.delete(battleId);
  } else {
    await saveBattle(battle);
    io.to(battleId).emit('round:start', {
      round: battle.currentRound, timeLimit: GAME.ROUND_TIMER_SECONDS,
    });

    if (!battleBotState.has(battleId)) {
      startRoundTimer(io, battleId);
    }
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

function clearMatchmakingTimer(userId: string) {
  const timer = matchmakingTimers.get(userId);
  if (timer) {
    clearTimeout(timer);
    matchmakingTimers.delete(userId);
  }
}

function randomAction(): { action: Action; powerIndex: null } {
  const actions = Object.values(Action);
  return { action: actions[Math.floor(Math.random() * actions.length)], powerIndex: null };
}
