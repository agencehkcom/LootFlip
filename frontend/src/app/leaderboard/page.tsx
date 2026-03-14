'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    api.getLeaderboard().then(setPlayers).catch(console.error);
  }, []);

  return (
    <div className="pb-20 px-4 pt-4">
      <h1 className="text-xl font-bold mb-4">Classement</h1>
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
        <p className="text-center text-gray-500 mt-8">Aucun joueur pour le moment</p>
      )}
      <NavBar />
    </div>
  );
}
