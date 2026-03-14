import { describe, it, expect } from 'vitest';
import { getLeagueFromTrophies, getNextLeagueThreshold, getSeasonReward, League } from '../types/league';

describe('league utils', () => {
  describe('getLeagueFromTrophies', () => {
    it('0 trophies = BRONZE', () => {
      expect(getLeagueFromTrophies(0)).toBe(League.BRONZE);
    });

    it('499 trophies = BRONZE', () => {
      expect(getLeagueFromTrophies(499)).toBe(League.BRONZE);
    });

    it('500 trophies = SILVER', () => {
      expect(getLeagueFromTrophies(500)).toBe(League.SILVER);
    });

    it('1000 trophies = GOLD', () => {
      expect(getLeagueFromTrophies(1000)).toBe(League.GOLD);
    });

    it('2000+ trophies = LEGEND', () => {
      expect(getLeagueFromTrophies(2500)).toBe(League.LEGEND);
    });
  });

  describe('getNextLeagueThreshold', () => {
    it('BRONZE next is 500', () => {
      expect(getNextLeagueThreshold(League.BRONZE)).toBe(500);
    });

    it('LEGEND has no next', () => {
      expect(getNextLeagueThreshold(League.LEGEND)).toBeNull();
    });
  });

  describe('getSeasonReward', () => {
    it('Legend #1 = 500', () => {
      expect(getSeasonReward(League.LEGEND, 1)).toBe(500);
    });

    it('Legend #50 = 150 >= Diamond #1 = 150', () => {
      expect(getSeasonReward(League.LEGEND, 50)).toBeGreaterThanOrEqual(
        getSeasonReward(League.DIAMOND, 1)
      );
    });

    it('Diamond #50 >= Gold #1', () => {
      expect(getSeasonReward(League.DIAMOND, 50)).toBeGreaterThanOrEqual(
        getSeasonReward(League.GOLD, 1)
      );
    });

    it('Gold #50 >= Silver #1', () => {
      expect(getSeasonReward(League.GOLD, 50)).toBeGreaterThanOrEqual(
        getSeasonReward(League.SILVER, 1)
      );
    });

    it('Silver #50 >= Bronze #1', () => {
      expect(getSeasonReward(League.SILVER, 50)).toBeGreaterThanOrEqual(
        getSeasonReward(League.BRONZE, 1)
      );
    });

    it('rank > 50 gets 0', () => {
      expect(getSeasonReward(League.LEGEND, 51)).toBe(0);
    });
  });
});
