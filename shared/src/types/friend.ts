export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum ChallengeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED',
}

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: string;
  friend: {
    id: string;
    username: string | null;
    displayName: string | null;
    elo: number;
    league: string;
  };
}

export interface RecentOpponent {
  id: string;
  opponentId: string;
  username: string | null;
  displayName: string | null;
  elo: number;
  league: string;
  foughtAt: string;
  isFriend: boolean;
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengerName: string | null;
  challengedId: string;
  challengedName: string | null;
  goldStake: number;
  status: ChallengeStatus;
  battleId: string | null;
  expiresAt: string;
}

export const FRIEND_CONSTANTS = {
  MAX_FRIENDS: 50,
  MAX_RECENT_OPPONENTS: 20,
  FRIEND_REQUEST_EXPIRE_DAYS: 7,
  CHALLENGE_EXPIRE_MINUTES: 5,
} as const;
