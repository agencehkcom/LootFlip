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
}

export interface ClientToServerEvents {
  'matchmaking:join': (data: { goldStake: number }) => void;
  'matchmaking:cancel': () => void;
  'round:action': (data: { action: Action; powerIndex: number | null }) => void;
  'use_potion': (data: { battleId: string }) => void;
}
