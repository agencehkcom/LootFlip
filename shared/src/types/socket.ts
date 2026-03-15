import type { Action, RoundResult, BattleResult, EquippedItem } from './battle';

export interface ServerToClientEvents {
  'matchmaking:found': (data: { battleId: string; opponent: { username: string; elo: number; equipment: EquippedItem[] } }) => void;
  'round:start': (data: { round: number; timeLimit: number }) => void;
  'round:result': (data: RoundResult) => void;
  'battle:end': (data: BattleResult) => void;
  'opponent:disconnected': () => void;
  'opponent:reconnected': () => void;
  'shadow:reveal': (data: { possibleActions: Action[] }) => void;
  'potion:used': (data: { playerId: string; newHp: number }) => void;
  'potion:failed': (data: { reason: string }) => void;
  // Phase 4 — Social
  'guild:chat:message': (data: { userId: string; username: string; content: string; createdAt: string }) => void;
  'guild:chat:history': (data: { messages: Array<{ userId: string; username: string; content: string; createdAt: string }> }) => void;
  'challenge:received': (data: { challengeId: string; challengerId: string; username: string; goldStake: number }) => void;
  'challenge:accepted': (data: { challengeId: string; battleId: string }) => void;
  'challenge:declined': (data: { challengeId: string }) => void;
  'war:started': (data: { warId: string; opponentGuildName: string }) => void;
  'war:update': (data: { warId: string; challengerWins: number; defenderWins: number }) => void;
  'war:ended': (data: { warId: string; winnerId: string; trophiesGained: number; goldGained: number }) => void;
  'tournament:update': (data: { bracket: any; status: string }) => void;
}

export interface ClientToServerEvents {
  'matchmaking:join': (data: { goldStake: number }) => void;
  'matchmaking:cancel': () => void;
  'round:action': (data: { action: Action; powerIndex: number | null }) => void;
  'use_potion': (data: { battleId: string }) => void;
  // Phase 4 — Social
  'guild:chat:send': (data: { content: string }) => void;
  'guild:chat:join': () => void;
  'challenge:send': (data: { friendId: string; goldStake: number }) => void;
  'challenge:respond': (data: { challengeId: string; accept: boolean }) => void;
}
