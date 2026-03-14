'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { HeroDisplay } from '@/components/HeroDisplay';
import { NavBar } from '@/components/NavBar';
import Link from 'next/link';

export default function HubPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      api.getUser().then(setProfile).catch(console.error);
    }
  }, [user]);

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

      <div className="text-center text-gray-400 text-sm mb-2">
        Elo {profile?.elo || 1000} | {profile?.trophies || 0} Trophees
      </div>

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
