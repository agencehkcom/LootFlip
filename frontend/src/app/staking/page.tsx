'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

const TIER_LABELS: Record<number, string> = { 7: '7 jours', 30: '30 jours', 90: '90 jours' };

export default function StakingPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [stakingInfo, setStakingInfo] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [lockDays, setLockDays] = useState(7);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try { setPositions(await api.getStakePositions()); } catch {}
    try { setStakingInfo(await api.getStakingInfo()); } catch {}
    setLoading(false);
  }

  async function handleStake() {
    if (!amount || Number(amount) <= 0) return;
    try {
      await api.stakeGem(Number(amount), lockDays);
      setMessage('GEM stakees !');
      setAmount('');
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleClaim(id: string) {
    try {
      await api.claimStakeRewards(id);
      setMessage('Rewards + stake reclames !');
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  const selectedTier = stakingInfo?.tiers?.find((t: any) => t.lockDays === lockDays);
  const previewReward = amount ? Math.floor(Number(amount) * (selectedTier?.apy || 1) / 100 * lockDays / 365) : 0;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-center mb-4">📈 Staking $GEM</h1>

      {message && (
        <div className="bg-green-900/50 border border-green-500 rounded p-2 mb-4 text-center text-sm">
          {message}<button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {/* APY Tiers */}
      {stakingInfo && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {stakingInfo.tiers.map((tier: any) => (
            <button key={tier.lockDays} onClick={() => setLockDays(tier.lockDays)}
              className={`rounded-lg p-3 text-center border ${lockDays === tier.lockDays ? 'border-yellow-400 bg-yellow-900/30' : 'border-gray-600 bg-gray-800'}`}>
              <div className="text-lg font-bold text-yellow-400">{tier.apy}%</div>
              <div className="text-xs text-gray-400">{TIER_LABELS[tier.lockDays]}</div>
              <div className="text-xs text-gray-500 mt-1">{tier.totalStaked} stakees</div>
            </button>
          ))}
        </div>
      )}

      {/* Stake form */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-bold mb-2">Staker des $GEM</h3>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
          className="w-full bg-gray-700 rounded px-3 py-2 text-sm mb-2" placeholder="Montant de GEM" />
        {amount && Number(amount) > 0 && (
          <div className="text-xs text-gray-400 mb-2">
            Reward estime : +{previewReward} 💎 apres {TIER_LABELS[lockDays]}
          </div>
        )}
        <button onClick={handleStake}
          className="w-full bg-purple-600 hover:bg-purple-500 rounded py-2 text-sm font-bold">
          Staker ({TIER_LABELS[lockDays]} · {selectedTier?.apy || 0}% APY)
        </button>
        <div className="text-xs text-gray-500 mt-2">
          Boosts actifs pendant le staking : +1 coffre/jour, +5% or en combat
        </div>
      </div>

      {/* Active positions */}
      <h2 className="text-sm font-bold mb-2">Mes positions ({positions.filter(p => !p.claimedAt).length})</h2>
      <div className="space-y-2">
        {positions.filter(p => !p.claimedAt).length === 0 ? (
          <p className="text-center text-gray-400 text-sm">Aucune position active</p>
        ) : positions.filter(p => !p.claimedAt).map((p: any) => {
          const daysLeft = Math.max(0, Math.ceil((new Date(p.unlocksAt).getTime() - Date.now()) / 86400000));
          return (
            <div key={p.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">{p.amount} 💎</span>
                <span className="text-xs text-gray-400">{p.apy * 100}% APY · {p.lockDays}j</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {p.isUnlocked ? '✅ Deblocable' : `⏳ ${daysLeft}j restants`}
                </span>
                <span className="text-xs text-green-400">+{p.rewardAmount} 💎 reward</span>
              </div>
              {p.isUnlocked && (
                <button onClick={() => handleClaim(p.id)}
                  className="w-full mt-2 bg-green-600 hover:bg-green-500 rounded py-1 text-sm">
                  Reclamer ({p.amount + p.rewardAmount} 💎)
                </button>
              )}
            </div>
          );
        })}
      </div>

      <NavBar />
    </main>
  );
}
