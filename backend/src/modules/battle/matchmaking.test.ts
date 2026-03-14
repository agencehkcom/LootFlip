import { describe, it, expect } from 'vitest';
import { findMatch, MatchmakingEntry } from './matchmaking.service';
import { GAME } from '@lootflip/shared';

describe('matchmaking', () => {
  it('should match players within Elo range', () => {
    const queue: MatchmakingEntry[] = [
      { userId: 'u1', elo: 1000, goldStake: 100, socketId: 's1', joinedAt: Date.now() },
    ];
    const player: MatchmakingEntry = {
      userId: 'u2', elo: 1100, goldStake: 100, socketId: 's2', joinedAt: Date.now(),
    };
    const match = findMatch(player, queue, GAME.ELO_MATCH_RANGE);
    expect(match).toBeTruthy();
    expect(match!.userId).toBe('u1');
  });

  it('should not match players outside Elo range', () => {
    const queue: MatchmakingEntry[] = [
      { userId: 'u1', elo: 1000, goldStake: 100, socketId: 's1', joinedAt: Date.now() },
    ];
    const player: MatchmakingEntry = {
      userId: 'u2', elo: 1500, goldStake: 100, socketId: 's2', joinedAt: Date.now(),
    };
    const match = findMatch(player, queue, GAME.ELO_MATCH_RANGE);
    expect(match).toBeNull();
  });

  it('should not match player with themselves', () => {
    const queue: MatchmakingEntry[] = [
      { userId: 'u1', elo: 1000, goldStake: 100, socketId: 's1', joinedAt: Date.now() },
    ];
    const player: MatchmakingEntry = {
      userId: 'u1', elo: 1000, goldStake: 100, socketId: 's2', joinedAt: Date.now(),
    };
    const match = findMatch(player, queue, GAME.ELO_MATCH_RANGE);
    expect(match).toBeNull();
  });
});
