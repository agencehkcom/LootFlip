export enum WalletType {
  CUSTODIAL = 'CUSTODIAL',
  EXTERNAL = 'EXTERNAL',
}

export enum TokenTxType {
  WITHDRAW = 'WITHDRAW',
  DEPOSIT = 'DEPOSIT',
  BURN = 'BURN',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
}

export enum TokenTxStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export enum ProposalStatus {
  ACTIVE = 'ACTIVE',
  PASSED = 'PASSED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum ProposalCategory {
  GAMEPLAY = 'GAMEPLAY',
  CONTENT = 'CONTENT',
  ECONOMY = 'ECONOMY',
}

export enum BurnSource {
  MARKETPLACE = 'MARKETPLACE',
  SHOP = 'SHOP',
  BUYBACK = 'BUYBACK',
}

export interface WalletInfo {
  id: string;
  type: WalletType;
  address: string;
  onChainBalance: number;
  inGameBalance: number;
}

export interface StakePosition {
  id: string;
  amount: number;
  lockDays: number;
  apy: number;
  startedAt: string;
  unlocksAt: string;
  claimedAt: string | null;
  rewardAmount: number;
  isUnlocked: boolean;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  category: ProposalCategory;
  options: string[];
  creatorId: string;
  status: ProposalStatus;
  startsAt: string;
  endsAt: string;
  totalVotes: number;
  results: Record<number, number>;
}

export interface TokenStats {
  totalSupply: number;
  circulatingSupply: number;
  totalBurned: number;
  totalStaked: number;
  burnBySource: Record<string, number>;
}

export const TOKEN_CONSTANTS = {
  TOTAL_SUPPLY: 1_000_000_000,
  WITHDRAW_MIN: 10,
  WITHDRAW_MAX: 1_000,
  WITHDRAW_COOLDOWN_HOURS: 24,
  MIN_STAKE_FOR_PROPOSAL: 100,
  GOVERNANCE_VOTE_HOURS: 72,
  GOVERNANCE_QUORUM_PERCENT: 5,
  STAKING_TIERS: [
    { lockDays: 7, apy: 0.01 },
    { lockDays: 30, apy: 0.03 },
    { lockDays: 90, apy: 0.05 },
  ],
  STAKING_BOOST_CHEST_PER_DAY: 1,
  STAKING_BOOST_GOLD_PERCENT: 5,
  BURN_MARKETPLACE_RATE: 0.02,
} as const;
