export enum Action {
  ATTACK = 'ATTACK',
  DEFEND = 'DEFEND',
  SPELL = 'SPELL',
}

export const ACTION_BEATS: Record<Action, Action> = {
  [Action.ATTACK]: Action.SPELL,
  [Action.DEFEND]: Action.ATTACK,
  [Action.SPELL]: Action.DEFEND,
};

export interface RoundAction {
  action: Action;
  powerIndex: number | null;
}

export interface RoundResult {
  round: number;
  p1Action: Action;
  p2Action: Action;
  p1Power: number | null;
  p2Power: number | null;
  p1Damage: number;
  p2Damage: number;
  p1Hp: number;
  p2Hp: number;
  shadowReveal?: Action[];
}

export interface BattleResult {
  battleId: string;
  winnerId: string | null;
  p1FinalHp: number;
  p2FinalHp: number;
  rounds: RoundResult[];
  rewards: {
    gold: number;
    trophies: number;
  };
}

export interface EquippedItem {
  type: string;
  trait: string;
  rarity: string;
  bonusDamage: number;
}

export interface BattleState {
  id: string;
  player1: PlayerState;
  player2: PlayerState;
  currentRound: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  goldStake: number;
}

export interface PlayerState {
  userId: string;
  hp: number;
  equipment: EquippedItem[];
  powersUsed: boolean[];
  connected: boolean;
}
