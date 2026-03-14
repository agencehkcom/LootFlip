'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { HeroDisplay } from '@/components/HeroDisplay';
import { LeagueBadge } from '@/components/LeagueBadge';
import { NavBar } from '@/components/NavBar';
import Link from 'next/link';

export default function HubPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      api.getUser().then(setProfile).catch(console.error);
      api.getSeasonRewards().then(setRewards).catch(() => {});
    }
  }, [user]);

  async function handleClaim() {
    await api.claimRewards();
    setRewards([]);
    const p = await api.getUser();
    setProfile(p);
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="pb-20 px-4 pt-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Loot Flip Arena</h1>
        <div className="flex gap-3 text-sm">
          <span className="text-yellow-400">{profile?.goldBalance || 0} GOLD</span>
          <span className="text-purple-400">{profile?.gemBalance || 0} GEM</span>
        </div>
      </div>

      {/* Rewards banner */}
      {rewards.length > 0 && (
        <button
          onClick={handleClaim}
          className="w-full bg-purple-700 hover:bg-purple-600 rounded-lg p-3 mb-3 text-center animate-pulse"
        >
          💎 {rewards.reduce((s: number, r: any) => s + r.gemReward, 0)} $GEM a recuperer !
        </button>
      )}

      {/* League badge */}
      {profile && (
        <LeagueBadge
          league={profile.league}
          trophies={profile.trophies}
          nextLeagueAt={profile.nextLeagueAt}
        />
      )}

      <HeroDisplay items={profile?.equippedItems || []} />

      <div className="grid grid-cols-2 gap-3 mt-6">
        <Link href="/chest" className="bg-yellow-600 hover:bg-yellow-500 rounded-lg p-4 text-center">
          <span className="text-2xl block">🎁</span>
          <span className="text-sm font-medium">Coffres</span>
          {profile?.chestStock > 0 && (
            <span className="block text-xs text-yellow-200">{profile.chestStock} disponible(s)</span>
          )}
        </Link>
        <Link href="/battle" className="bg-red-600 hover:bg-red-500 rounded-lg p-4 text-center">
          <span className="text-2xl block">⚔️</span>
          <span className="text-sm font-medium">Arene</span>
        </Link>
        <Link href="/inventory" className="bg-blue-600 hover:bg-blue-500 rounded-lg p-4 text-center">
          <span className="text-2xl block">🎒</span>
          <span className="text-sm font-medium">Inventaire</span>
        </Link>
        <Link href="/leaderboard" className="bg-green-600 hover:bg-green-500 rounded-lg p-4 text-center">
          <span className="text-2xl block">🏆</span>
          <span className="text-sm font-medium">Classement</span>
        </Link>
      </div>

      <NavBar />
    </div>
  );
}
