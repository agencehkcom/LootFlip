'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

export default function TokenPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTokenStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="min-h-screen bg-gray-900 text-white p-4 pb-20"><p className="text-center text-gray-400">Chargement...</p><NavBar /></main>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-center mb-4">📊 $GEM Token</h1>

      {stats && (
        <>
          {/* Supply overview */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h2 className="text-sm font-bold mb-3">Supply</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">{(stats.totalSupply / 1e9).toFixed(1)}B</div>
                <div className="text-xs text-gray-400">Supply total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">{(stats.circulatingSupply / 1e6).toFixed(0)}M</div>
                <div className="text-xs text-gray-400">En circulation</div>
              </div>
            </div>
          </div>

          {/* Burn stats */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h2 className="text-sm font-bold mb-3">🔥 Burn</h2>
            <div className="text-center mb-3">
              <div className="text-2xl font-bold text-red-400">{stats.totalBurned.toLocaleString()}</div>
              <div className="text-xs text-gray-400">$GEM brulees au total</div>
            </div>
            <div className="space-y-1">
              {Object.entries(stats.burnBySource).map(([source, amount]: [string, any]) => (
                <div key={source} className="flex justify-between text-sm">
                  <span className="text-gray-400">{source}</span>
                  <span className="text-red-400">{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Staking */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <h2 className="text-sm font-bold mb-3">📈 Staking</h2>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.totalStaked.toLocaleString()}</div>
              <div className="text-xs text-gray-400">$GEM stakees</div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 rounded-full h-2"
                  style={{ width: `${Math.min(100, stats.totalStaked / stats.totalSupply * 100)}%` }} />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {(stats.totalStaked / stats.totalSupply * 100).toFixed(4)}% du supply
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-bold mb-3">Distribution initiale</h2>
            <div className="space-y-2">
              {[
                { label: 'Play-to-Earn', pct: 50, color: 'bg-green-500' },
                { label: 'Staking Rewards', pct: 20, color: 'bg-purple-500' },
                { label: 'Equipe', pct: 10, color: 'bg-blue-500' },
                { label: 'Tresorerie', pct: 10, color: 'bg-yellow-500' },
                { label: 'Liquidite DEX', pct: 10, color: 'bg-red-500' },
              ].map(d => (
                <div key={d.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{d.label}</span><span>{d.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className={`${d.color} rounded-full h-1.5`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <NavBar />
    </main>
  );
}
