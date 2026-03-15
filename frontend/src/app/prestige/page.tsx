'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

export default function PrestigePage() {
  const [info, setInfo] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInfo(); }, []);

  async function loadInfo() {
    setLoading(true);
    try { setInfo(await api.getPrestigeInfo()); } catch {}
    setLoading(false);
  }

  async function handlePrestige() {
    if (!confirm('ATTENTION : Tous tes items et ton or seront supprimes. Tes gemmes, Elo, cosmétiques et staking sont conserves. Continuer ?')) return;
    try {
      const result = await api.activatePrestige();
      setMessage(`Prestige ${result.newLevel} active ! +${result.damageBonus}% degats permanents`);
      loadInfo();
    } catch (e: any) { setMessage(e.message); }
  }

  if (loading) return <main className="min-h-screen bg-gray-900 text-white p-4 pb-20"><p className="text-center text-gray-400">Chargement...</p><NavBar /></main>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-center mb-4">⭐ Prestige</h1>

      {message && (
        <div className="bg-green-900/50 border border-green-500 rounded p-2 mb-4 text-center text-sm">
          {message}<button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {info && (
        <>
          {/* Current prestige */}
          <div className="bg-gray-800 rounded-lg p-6 mb-4 text-center">
            <div className="text-6xl mb-2">{'⭐'.repeat(Math.min(info.currentLevel, 5))}{info.currentLevel > 5 ? '🌟'.repeat(info.currentLevel - 5) : ''}</div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">Prestige {info.currentLevel}</div>
            <div className="text-lg text-green-400">+{info.currentBonus}% degats permanents</div>
            {info.currentLevel < info.maxLevel && (
              <div className="text-sm text-gray-400 mt-2">Prochain niveau : +{info.nextBonus}% degats</div>
            )}
          </div>

          {/* What you keep / lose */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-3">
              <h3 className="text-sm font-bold text-green-400 mb-2">Tu gardes</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>💎 Gemmes ($GEM)</li>
                <li>🏆 Elo & Trophees</li>
                <li>✨ Cosmetiques</li>
                <li>📈 Staking positions</li>
                <li>🏰 Guilde</li>
                <li>👥 Amis</li>
              </ul>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-3">
              <h3 className="text-sm font-bold text-red-400 mb-2">Tu perds</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>🗡️ Tous les items</li>
                <li>🪙 Tout l'or</li>
                <li>🧪 Potions</li>
              </ul>
            </div>
          </div>

          {/* Tu gagnes */}
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3 mb-4">
            <h3 className="text-sm font-bold text-yellow-400 mb-2">Tu gagnes</h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>⭐ +5% degats permanents</li>
              <li>🎖️ Badge Prestige {info.currentLevel + 1}</li>
              <li>📦 3 coffres gratuits</li>
              {info.currentLevel === 0 && <li>🏅 Acces a la ligue Mythic (2500+ trophees)</li>}
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <h3 className="text-sm font-bold mb-2">Conditions</h3>
            <div className="flex justify-between text-sm">
              <span>Trophees requis</span>
              <span className={info.requirements.currentTrophies >= info.requirements.minTrophies ? 'text-green-400' : 'text-red-400'}>
                {info.requirements.currentTrophies} / {info.requirements.minTrophies}
              </span>
            </div>
          </div>

          {/* Prestige button */}
          {info.currentLevel >= info.maxLevel ? (
            <div className="text-center text-yellow-400 font-bold text-lg">Prestige MAX atteint !</div>
          ) : (
            <button onClick={handlePrestige} disabled={!info.canPrestige}
              className={`w-full py-4 rounded-lg font-bold text-lg ${
                info.canPrestige ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}>
              {info.canPrestige ? `Activer Prestige ${info.currentLevel + 1}` : 'Conditions non remplies'}
            </button>
          )}
        </>
      )}

      <NavBar />
    </main>
  );
}
