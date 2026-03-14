'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

const LEAGUES = [
  { key: '', label: 'Tous', icon: '🌐' },
  { key: 'LEGEND', label: 'Legende', icon: '👑' },
  { key: 'DIAMOND', label: 'Diamant', icon: '💎' },
  { key: 'GOLD', label: 'Or', icon: '🥇' },
  { key: 'SILVER', label: 'Argent', icon: '🥈' },
  { key: 'BRONZE', label: 'Bronze', icon: '🥉' },
];

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [seasonInfo, setSeasonInfo] = useState<any>(null);

  useEffect(() => {
    api.getLeaderboard(selectedLeague || undefined).then(setPlayers).catch(console.error);
  }, [selectedLeague]);

  useEffect(() => {
    api.getSeasonInfo().then(setSeasonInfo).catch(() => {});
  }, []);

  const daysLeft = seasonInfo
    ? Math.max(0, Math.ceil((new Date(seasonInfo.weekEnd).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="pb-20 px-4 pt-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-bold">Classement</h1>
        {daysLeft !== null && (
          <span className="text-xs text-gray-400">Saison finit dans {daysLeft}j</span>
        )}
      </div>

      {seasonInfo && (
        <div className="bg-gray-800 rounded-lg p-2 mb-3 text-center text-sm">
          Ton rang : <span className="text-yellow-400 font-bold">#{seasonInfo.rank}</span>
          {seasonInfo.potentialReward > 0 && (
            <span className="text-purple-400 ml-2">+{seasonInfo.potentialReward} $GEM</span>
          )}
        </div>
      )}

      {/* League tabs */}
      <div className="flex gap-1 overflow-x-auto mb-4 pb-1">
        {LEAGUES.map(l => (
          <button
            key={l.key}
            onClick={() => setSelectedLeague(l.key)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
              selectedLeague === l.key
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            {l.icon} {l.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {players.map((p, i) => (
          <div key={p.id} className="flex items-center bg-gray-800 rounded-lg p-3">
            <span className="w-8 text-center font-bold text-gray-400">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
            </span>
            <span className="flex-1 ml-3">{p.displayName || p.username || 'Anonyme'}</span>
            <span className="text-yellow-400 text-sm">{p.trophies} 🏆</span>
            <span className="text-gray-400 text-xs ml-3">Elo {p.elo}</span>
          </div>
        ))}
      </div>
      {players.length === 0 && (
        <p className="text-center text-gray-500 mt-8">Aucun joueur dans cette ligue</p>
      )}
      <NavBar />
    </div>
  );
}
