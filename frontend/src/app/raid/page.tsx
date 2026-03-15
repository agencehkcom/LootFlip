'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';

const ELEMENT_ICONS: Record<string, string> = {
  FIRE: '🔥', ICE: '❄️', THUNDER: '⚡', SHADOW: '👻', POISON: '🧪', HOLY: '✨',
};

const DIFF_COLORS: Record<string, string> = {
  NORMAL: 'bg-green-700', HEROIC: 'bg-blue-700', MYTHIC: 'bg-red-700',
};

export default function RaidPage() {
  const { user } = useAuth();
  const [raid, setRaid] = useState<any>(null);
  const [bosses, setBosses] = useState<any[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<string>('');
  const [difficulty, setDifficulty] = useState('NORMAL');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try { setBosses(await api.getRaidBosses()); } catch {}
    try {
      const guildData = await api.getMyGuild();
      if (guildData) {
        const activeRaid = await api.getActiveRaid(guildData.guildId);
        setRaid(activeRaid);
      }
    } catch {}
    setLoading(false);
  }

  async function handleStart() {
    if (!selectedBoss) return;
    try {
      const guildData = await api.getMyGuild();
      if (!guildData) { setMessage('Rejoins une guilde d\'abord'); return; }
      await api.startRaid(guildData.guildId, selectedBoss, difficulty);
      setMessage('Raid lance !');
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleAttempt() {
    if (!raid) return;
    try {
      const result = await api.attemptRaid(raid.id);
      setLastResult(result);
      setMessage(`${result.totalDamage} degats infliges !${result.bossKilled ? ' BOSS TUE !' : ''}`);
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleClaim() {
    if (!raid) return;
    try {
      await api.claimRaidReward(raid.id);
      setMessage('Rewards reclames !');
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  if (loading) return <main className="min-h-screen bg-gray-900 text-white p-4 pb-20"><p className="text-center text-gray-400">Chargement...</p><NavBar /></main>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-center mb-4">🐉 Raids</h1>

      {message && (
        <div className="bg-green-900/50 border border-green-500 rounded p-2 mb-4 text-center text-sm">
          {message}<button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {raid ? (
        <>
          {/* Active raid */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg">{ELEMENT_ICONS[raid.boss.element]} {raid.boss.name}</h2>
              <span className={`text-xs px-2 py-1 rounded ${DIFF_COLORS[raid.difficulty]}`}>{raid.difficulty}</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">{raid.boss.description}</p>

            {/* HP bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>HP</span>
                <span>{raid.currentHp} / {raid.boss.maxHp * (raid.difficulty === 'MYTHIC' ? 3 : raid.difficulty === 'HEROIC' ? 2 : 1)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div className="bg-red-500 rounded-full h-3 transition-all"
                  style={{ width: `${(raid.currentHp / (raid.boss.maxHp * (raid.difficulty === 'MYTHIC' ? 3 : raid.difficulty === 'HEROIC' ? 2 : 1))) * 100}%` }} />
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-3">
              Expire {new Date(raid.endsAt).toLocaleString()}
            </div>

            {raid.status === 'ACTIVE' && (
              <button onClick={handleAttempt}
                className="w-full bg-red-600 hover:bg-red-500 rounded py-3 font-bold text-lg mb-2">
                ⚔️ Attaquer le boss (3 tentatives max)
              </button>
            )}

            {raid.status === 'COMPLETED' && (
              <button onClick={handleClaim}
                className="w-full bg-green-600 hover:bg-green-500 rounded py-3 font-bold">
                🎁 Reclamer les rewards
              </button>
            )}

            {raid.status === 'FAILED' && (
              <p className="text-center text-red-400 font-bold">Raid echoue — le boss a survecu</p>
            )}
          </div>

          {/* Leaderboard */}
          <h3 className="text-sm font-bold mb-2">Classement des degats</h3>
          <div className="space-y-1">
            {raid.attempts?.map((a: any, i: number) => (
              <div key={a.id} className="bg-gray-800 rounded p-2 flex justify-between text-sm">
                <span>#{i + 1} {a.user.displayName || a.user.username}</span>
                <span className="text-yellow-400">{a.damageDealt} dmg</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Start new raid */}
          <h2 className="text-sm font-bold mb-2">Lancer un raid</h2>
          <div className="space-y-2 mb-4">
            {bosses.map(boss => (
              <button key={boss.id} onClick={() => setSelectedBoss(boss.id)}
                className={`w-full text-left rounded-lg p-3 border ${selectedBoss === boss.id ? 'border-yellow-400 bg-yellow-900/20' : 'border-gray-600 bg-gray-800'}`}>
                <div className="font-bold">{ELEMENT_ICONS[boss.element]} {boss.name}</div>
                <div className="text-xs text-gray-400">{boss.description} · {boss.maxHp} HP</div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            {['NORMAL', 'HEROIC', 'MYTHIC'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded text-sm ${difficulty === d ? DIFF_COLORS[d] : 'bg-gray-700'}`}>
                {d}
              </button>
            ))}
          </div>

          <button onClick={handleStart} disabled={!selectedBoss}
            className={`w-full py-3 rounded-lg font-bold ${selectedBoss ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-700 text-gray-500'}`}>
            Lancer le raid
          </button>
        </>
      )}

      <NavBar />
    </main>
  );
}
