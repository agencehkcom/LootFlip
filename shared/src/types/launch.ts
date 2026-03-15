export enum QuestType {
  LOGIN = 'LOGIN',
  FIRST_WIN = 'FIRST_WIN',
  THREE_BATTLES = 'THREE_BATTLES',
}

export enum AnalyticsEventType {
  SIGNUP = 'SIGNUP',
  LOGIN = 'LOGIN',
  BATTLE_START = 'BATTLE_START',
  BATTLE_END = 'BATTLE_END',
  CHEST_OPEN = 'CHEST_OPEN',
  SHOP_BUY = 'SHOP_BUY',
  MARKET_LIST = 'MARKET_LIST',
  MARKET_BUY = 'MARKET_BUY',
  CRAFT = 'CRAFT',
  GUILD_JOIN = 'GUILD_JOIN',
  REFERRAL = 'REFERRAL',
  PRESTIGE = 'PRESTIGE',
  STAKE = 'STAKE',
  WITHDRAW = 'WITHDRAW',
}

export interface DailyQuest {
  id: string;
  questType: QuestType;
  completed: boolean;
  rewardClaimed: boolean;
  reward: { gold?: number; chests?: number };
}

export interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  totalReferred: number;
  totalBonusClaimed: number;
}

export const QUEST_REWARDS: Record<QuestType, { gold?: number; chests?: number }> = {
  [QuestType.LOGIN]: { gold: 50 },
  [QuestType.FIRST_WIN]: { gold: 100 },
  [QuestType.THREE_BATTLES]: { chests: 1 },
};

export const REFERRAL_BONUS = {
  GOLD: 200,
  CHESTS: 2,
} as const;

export const AIRDROP = {
  GEM_AMOUNT: 10,
  MAX_PLAYERS: 1000,
} as const;

export const ONBOARDING_SLIDES = [
  { title: 'Bienvenue dans Loot Flip Arena !', description: 'Un jeu PvP ou tu combats pour du loot et des $GEM.' },
  { title: 'Combat Chifoumi', description: 'Attaque bat Sort, Sort bat Defense, Defense bat Attaque. Simple mais strategique !' },
  { title: 'Equipe-toi', description: 'Ouvre des coffres, equipe des items avec des pouvoirs speciaux (Feu, Glace, Foudre...).' },
  { title: 'Gagne des $GEM', description: 'Monte en ligue, gagne des saisons, et retire tes $GEM en vrais tokens !' },
] as const;
