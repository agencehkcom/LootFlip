export enum League {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND',
  LEGEND = 'LEGEND',
}

export const LEAGUE_THRESHOLDS: Record<League, number> = {
  [League.BRONZE]: 0,
  [League.SILVER]: 500,
  [League.GOLD]: 1000,
  [League.DIAMOND]: 1500,
  [League.LEGEND]: 2000,
};

export const LEAGUE_GOLD_STAKES: Record<League, number> = {
  [League.BRONZE]: 50,
  [League.SILVER]: 100,
  [League.GOLD]: 200,
  [League.DIAMOND]: 500,
  [League.LEGEND]: 1000,
};

export const LEAGUE_ORDER: League[] = [
  League.BRONZE,
  League.SILVER,
  League.GOLD,
  League.DIAMOND,
  League.LEGEND,
];

export const SEASON_REWARDS: Record<League, Record<string, number>> = {
  [League.BRONZE]:  { top1: 5,  top5: 3,  top20: 2, top50: 1 },
  [League.SILVER]:  { top1: 20, top5: 12, top20: 7, top50: 5 },
  [League.GOLD]:    { top1: 60, top5: 40, top20: 25, top50: 20 },
  [League.DIAMOND]: { top1: 150, top5: 100, top20: 65, top50: 60 },
  [League.LEGEND]:  { top1: 500, top5: 350, top20: 200, top50: 150 },
};

export function getLeagueFromTrophies(trophies: number): League {
  for (let i = LEAGUE_ORDER.length - 1; i >= 0; i--) {
    if (trophies >= LEAGUE_THRESHOLDS[LEAGUE_ORDER[i]]) {
      return LEAGUE_ORDER[i];
    }
  }
  return League.BRONZE;
}

export function getNextLeagueThreshold(league: League): number | null {
  const idx = LEAGUE_ORDER.indexOf(league);
  if (idx >= LEAGUE_ORDER.length - 1) return null;
  return LEAGUE_THRESHOLDS[LEAGUE_ORDER[idx + 1]];
}

export function getSeasonReward(league: League, rank: number): number {
  const rewards = SEASON_REWARDS[league];
  if (rank === 1) return rewards.top1;
  if (rank <= 5) return rewards.top5;
  if (rank <= 20) return rewards.top20;
  if (rank <= 50) return rewards.top50;
  return 0;
}
