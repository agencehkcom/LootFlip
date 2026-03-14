'use client';

const LEAGUE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  BRONZE: { icon: '🥉', color: 'text-orange-400', label: 'Bronze' },
  SILVER: { icon: '🥈', color: 'text-gray-300', label: 'Argent' },
  GOLD: { icon: '🥇', color: 'text-yellow-400', label: 'Or' },
  DIAMOND: { icon: '💎', color: 'text-cyan-400', label: 'Diamant' },
  LEGEND: { icon: '👑', color: 'text-purple-400', label: 'Legende' },
};

interface LeagueBadgeProps {
  league: string;
  trophies: number;
  nextLeagueAt: number | null;
  compact?: boolean;
}

export function LeagueBadge({ league, trophies, nextLeagueAt, compact }: LeagueBadgeProps) {
  const config = LEAGUE_CONFIG[league] || LEAGUE_CONFIG.BRONZE;

  if (compact) {
    return (
      <span className={`${config.color} font-bold`}>
        {config.icon} {config.label}
      </span>
    );
  }

  const progress = nextLeagueAt
    ? ((trophies - (nextLeagueAt - 500)) / 500) * 100
    : 100;

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-lg font-bold ${config.color}`}>
          {config.icon} {config.label}
        </span>
        <span className="text-sm text-gray-400">{trophies} trophees</span>
      </div>
      {nextLeagueAt && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{trophies}</span>
            <span>{nextLeagueAt}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r from-gray-500 to-yellow-400`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
