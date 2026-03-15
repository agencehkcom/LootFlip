export enum RaidDifficulty {
  NORMAL = 'NORMAL',
  HEROIC = 'HEROIC',
  MYTHIC = 'MYTHIC',
}

export enum RaidStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum BossElement {
  FIRE = 'FIRE',
  ICE = 'ICE',
  THUNDER = 'THUNDER',
  SHADOW = 'SHADOW',
  POISON = 'POISON',
  HOLY = 'HOLY',
}

export enum EventType {
  DOUBLE_DROP = 'DOUBLE_DROP',
  DOUBLE_GOLD = 'DOUBLE_GOLD',
  BOSS_WORLD = 'BOSS_WORLD',
  FLASH_TOURNAMENT = 'FLASH_TOURNAMENT',
  TRAIT_BOOST = 'TRAIT_BOOST',
}

export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface RaidBoss {
  id: string;
  name: string;
  description: string;
  element: BossElement;
  maxHp: number;
  mechanic: Record<string, unknown>;
}

export interface Raid {
  id: string;
  guildId: string;
  bossId: string;
  boss: RaidBoss;
  difficulty: RaidDifficulty;
  currentHp: number;
  status: RaidStatus;
  startsAt: string;
  endsAt: string;
}

export interface GameEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  config: Record<string, unknown>;
  status: EventStatus;
  startsAt: string;
  endsAt: string;
}

export const RAID_CONSTANTS = {
  DURATION_HOURS: 48,
  MAX_ATTEMPTS: 3,
  ROUNDS_PER_ATTEMPT: 5,
  HP_MULTIPLIER: { NORMAL: 1, HEROIC: 2, MYTHIC: 3 },
  REWARDS: {
    NORMAL: { gold: 100, gem: 5 },
    HEROIC: { gold: 300, gem: 15 },
    MYTHIC: { gold: 1000, gem: 50 },
  },
} as const;

export const PRESTIGE_CONSTANTS = {
  MAX_LEVEL: 10,
  DAMAGE_BONUS_PER_LEVEL: 0.05,
  MIN_TROPHIES: 2000,
} as const;

export const MYTHIC_LEAGUE = {
  THRESHOLD: 2500,
  MIN_PRESTIGE: 1,
  GOLD_STAKE: 2000,
  SEASON_REWARD_MULTIPLIER: 2,
} as const;
