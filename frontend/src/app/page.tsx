'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { HeroDisplay } from '@/components/HeroDisplay';
import { LeagueBadge } from '@/components/LeagueBadge';
import { NavBar } from '@/components/NavBar';
import Link from 'next/link';

const QUEST_LABELS: Record<string, { icon: string; label: string }> = {
  LOGIN: { icon: '📅', label: 'Connexion du jour' },
  FIRST_WIN: { icon: '🏆', label: 'Premiere victoire' },
  THREE_BATTLES: { icon: '⚔️', label: '3 combats' },
};

const QUEST_REWARDS: Record<string, string> = {
  LOGIN: '50 🪙',
  FIRST_WIN: '100 🪙',
  THREE_BATTLES: '1 📦',
};

export default function HubPage() {
  const router = useRouter();
  const { user, loading, isNewUser, error: authError } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      api.getUser().then(p => {
        setProfile(p);
        // Redirect new users to onboarding
        if (!p.hasCompletedTutorial) {
          router.push('/onboarding');
        }
      }).catch(console.error);
      api.getSeasonRewards().then(setRewards).catch(() => {});
      api.getDailyQuests().then(setQuests).catch(() => {});
      api.getReferralInfo().then(setReferralInfo).catch(() => {});
    }
  }, [user, router]);

  async function handleClaim() {
    await api.claimRewards();
    setRewards([]);
    const p = await api.getUser();
    setProfile(p);
  }

  async function handleClaimQuest(questId: string) {
    try {
      await api.claimQuestReward(questId);
      setMessage('Reward reclame !');
      setQuests(await api.getDailyQuests());
      setProfile(await api.getUser());
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleAirdrop() {
    try {
      const result = await api.claimAirdrop();
      setMessage(`Airdrop de ${result.amount} GEM reclame !`);
      setProfile(await api.getUser());
    } catch (e: any) { setMessage(e.message); }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Chargement...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold mb-4">Loot Flip Arena</h1>
        {authError && <p className="text-red-400 text-sm mb-2">Erreur: {authError}</p>}
        <p className="text-gray-400 text-sm text-center">Ouvre ce jeu depuis Telegram pour te connecter automatiquement.</p>
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 pt-4 min-h-screen text-white relative">
      <div className="fixed inset-0 -z-10">
        <img src="/assets/backgrounds/bg-hub.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Loot Flip Arena</h1>
        <div className="flex gap-3 text-sm">
          <span className="text-yellow-400">{profile?.goldBalance || 0} 🪙</span>
          <span className="text-purple-400">{profile?.gemBalance || 0} 💎</span>
        </div>
      </div>

      {message && (
        <div className="bg-green-900/50 border border-green-500 rounded p-2 mb-3 text-center text-sm">
          {message}<button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {/* Airdrop banner */}
      <button onClick={handleAirdrop}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-3 mb-3 text-center text-sm font-bold">
        🎁 Reclame ton airdrop de 10 $GEM gratuits !
      </button>

      {/* Season rewards */}
      {rewards.length > 0 && (
        <button onClick={handleClaim}
          className="w-full bg-purple-700 hover:bg-purple-600 rounded-lg p-3 mb-3 text-center animate-pulse">
          💎 {rewards.reduce((s: number, r: any) => s + r.gemReward, 0)} $GEM a recuperer !
        </button>
      )}

      {/* League badge */}
      {profile && (
        <LeagueBadge league={profile.league} trophies={profile.trophies} nextLeagueAt={profile.nextLeagueAt} />
      )}

      <HeroDisplay items={profile?.equippedItems || []} />

      {/* Daily quests */}
      <div className="mt-4 mb-4">
        <h2 className="text-sm font-bold mb-2">Quetes du jour</h2>
        <div className="space-y-2">
          {quests.map((q: any) => {
            const info = QUEST_LABELS[q.questType] || { icon: '❓', label: q.questType };
            return (
              <div key={q.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{info.icon}</span>
                  <div>
                    <div className="text-sm">{info.label}</div>
                    <div className="text-xs text-gray-400">{QUEST_REWARDS[q.questType]}</div>
                  </div>
                </div>
                {q.rewardClaimed ? (
                  <span className="text-xs text-green-400">Fait ✓</span>
                ) : q.completed ? (
                  <button onClick={() => handleClaimQuest(q.id)}
                    className="text-xs bg-green-600 rounded px-3 py-1">Reclamer</button>
                ) : (
                  <span className="text-xs text-gray-500">En cours</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Link href="/chest" className="bg-yellow-600 hover:bg-yellow-500 rounded-lg p-3 text-center">
          <span className="text-xl block">🎁</span>
          <span className="text-xs">Coffres</span>
        </Link>
        <Link href="/battle" className="bg-red-600 hover:bg-red-500 rounded-lg p-3 text-center">
          <span className="text-xl block">⚔️</span>
          <span className="text-xs">Arene</span>
        </Link>
        <Link href="/inventory" className="bg-blue-600 hover:bg-blue-500 rounded-lg p-3 text-center">
          <span className="text-xl block">🎒</span>
          <span className="text-xs">Inventaire</span>
        </Link>
        <Link href="/shop" className="bg-green-600 hover:bg-green-500 rounded-lg p-3 text-center">
          <span className="text-xl block">🛒</span>
          <span className="text-xs">Shop</span>
        </Link>
        <Link href="/raid" className="bg-purple-600 hover:bg-purple-500 rounded-lg p-3 text-center">
          <span className="text-xl block">🐉</span>
          <span className="text-xs">Raids</span>
        </Link>
        <Link href="/leaderboard" className="bg-gray-600 hover:bg-gray-500 rounded-lg p-3 text-center">
          <span className="text-xl block">🏆</span>
          <span className="text-xs">Classement</span>
        </Link>
        <Link href="/prestige" className="bg-yellow-700 hover:bg-yellow-600 rounded-lg p-3 text-center">
          <span className="text-xl block">⭐</span>
          <span className="text-xs">Prestige</span>
        </Link>
        <Link href="/events" className="bg-pink-600 hover:bg-pink-500 rounded-lg p-3 text-center">
          <span className="text-xl block">🎉</span>
          <span className="text-xs">Events</span>
        </Link>
        <Link href="/friends" className="bg-indigo-600 hover:bg-indigo-500 rounded-lg p-3 text-center">
          <span className="text-xl block">👥</span>
          <span className="text-xs">Social</span>
        </Link>
      </div>

      {/* Referral */}
      {referralInfo && (
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <h2 className="text-sm font-bold mb-2">Invite tes amis</h2>
          <p className="text-xs text-gray-400 mb-2">Toi et ton ami recevez 200 🪙 + 2 📦</p>
          <div className="bg-gray-700 rounded p-2 text-xs font-mono break-all">
            {referralInfo.referralLink}
          </div>
          <div className="text-xs text-gray-500 mt-1">{referralInfo.totalReferred} ami(s) invites</div>
        </div>
      )}

      <NavBar />
    </div>
  );
}
