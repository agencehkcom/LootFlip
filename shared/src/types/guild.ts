export enum GuildRole {
  LEADER = 'LEADER',
  CO_LEADER = 'CO_LEADER',
  OFFICER = 'OFFICER',
  MEMBER = 'MEMBER',
}

export enum WarStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export enum TournamentStatus {
  REGISTERING = 'REGISTERING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  goldTreasury: number;
  gemTreasury: number;
  trophies: number;
  membersCount: number;
  createdAt: string;
}

export interface GuildMember {
  id: string;
  guildId: string;
  userId: string;
  username: string | null;
  displayName: string | null;
  role: GuildRole;
  elo: number;
  league: string;
  joinedAt: string;
}

export interface GuildWar {
  id: string;
  challengerGuildId: string;
  challengerGuildName: string;
  defenderGuildId: string;
  defenderGuildName: string;
  status: WarStatus;
  challengerWins: number;
  defenderWins: number;
  winnerId: string | null;
  startsAt: string | null;
  endsAt: string | null;
}

export const GUILD_CONSTANTS = {
  MAX_MEMBERS: 10,
  CREATION_COST: 500,
  DONATION_COOLDOWN_HOURS: 24,
  DONATION_MAX_GOLD: 1000,
  DONATION_MAX_GEM: 50,
  DONATION_MAX_ITEMS: 1,
  WAR_DURATION_HOURS: 24,
  WAR_ACCEPT_TIMEOUT_HOURS: 24,
  WAR_WINNER_TROPHIES: 50,
  WAR_PARTICIPANT_GOLD: 100,
  TOURNAMENT_ENTRY_COST: 500,
  TOURNAMENT_1ST_TROPHIES: 200,
  TOURNAMENT_1ST_GOLD: 2000,
  TOURNAMENT_2ND_TROPHIES: 100,
  TOURNAMENT_2ND_GOLD: 1000,
  TOURNAMENT_SEMI_TROPHIES: 50,
  TOURNAMENT_SEMI_GOLD: 500,
} as const;

export const ROLE_HIERARCHY: Record<GuildRole, number> = {
  [GuildRole.LEADER]: 4,
  [GuildRole.CO_LEADER]: 3,
  [GuildRole.OFFICER]: 2,
  [GuildRole.MEMBER]: 1,
};
