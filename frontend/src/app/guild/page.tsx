'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';

const ROLE_LABELS: Record<string, string> = {
  LEADER: '👑 Chef', CO_LEADER: '⭐ Co-Chef', OFFICER: '🛡️ Officier', MEMBER: '👤 Membre',
};

export default function GuildPage() {
  const { user } = useAuth();
  const [guildData, setGuildData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [donateGold, setDonateGold] = useState('');
  const [announceText, setAnnounceText] = useState('');
  const [tab, setTab] = useState<'members' | 'chat' | 'announce' | 'donate'>('members');

  useEffect(() => { loadGuild(); }, []);

  async function loadGuild() {
    setLoading(true);
    try {
      const data = await api.getMyGuild();
      setGuildData(data);
    } catch { setGuildData(null); }
    setLoading(false);
  }

  async function handleLeave() {
    if (!guildData) return;
    if (!confirm('Quitter la guilde ?')) return;
    try {
      await api.leaveGuild(guildData.guildId);
      setMessage('Guilde quittee');
      setGuildData(null);
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleKick(targetUserId: string) {
    try {
      await api.kickMember(guildData.guildId, targetUserId);
      setMessage('Membre expulse');
      loadGuild();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handlePromote(targetUserId: string) {
    try {
      await api.promoteMember(guildData.guildId, targetUserId);
      loadGuild();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleDemote(targetUserId: string) {
    try {
      await api.demoteMember(guildData.guildId, targetUserId);
      loadGuild();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleDonate() {
    try {
      await api.donate(guildData.guildId, Number(donateGold) || 0, 0);
      setMessage('Donation effectuee !');
      setDonateGold('');
      loadGuild();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleAnnounce() {
    if (!announceText.trim()) return;
    try {
      await api.postAnnouncement(guildData.guildId, announceText, false);
      setAnnounceText('');
      loadGuild();
    } catch (e: any) { setMessage(e.message); }
  }

  if (loading) return <main className="min-h-screen bg-gray-900 text-white p-4 pb-20"><p className="text-center text-gray-400">Chargement...</p><NavBar /></main>;

  if (!guildData) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
        <h1 className="text-2xl font-bold text-center mb-6">🏰 Guilde</h1>
        <p className="text-center text-gray-400 mb-6">Tu n'es dans aucune guilde</p>
        <Link href="/guild/search" className="block w-full bg-yellow-600 hover:bg-yellow-500 text-center py-3 rounded-lg font-bold text-lg">
          Trouver ou creer une guilde
        </Link>
        <NavBar />
      </main>
    );
  }

  const guild = guildData.guild;
  const myRole = guildData.role;
  const canManage = myRole === 'LEADER' || myRole === 'CO_LEADER';

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-center mb-2">🏰 {guild.name}</h1>
      <p className="text-center text-gray-400 text-sm mb-4">{guild.description}</p>

      {message && (
        <div className="bg-blue-900/50 border border-blue-500 rounded p-2 mb-4 text-center text-sm">
          {message}<button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <div className="text-yellow-400 font-bold">{guild.trophies}</div>
          <div className="text-xs text-gray-400">Trophees</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <div className="text-yellow-400 font-bold">{guild.goldTreasury} 🪙</div>
          <div className="text-xs text-gray-400">Tresor Or</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <div className="text-yellow-400 font-bold">{guild.gemTreasury} 💎</div>
          <div className="text-xs text-gray-400">Tresor Gem</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(['members', 'chat', 'announce', 'donate'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded text-xs font-medium ${tab === t ? 'bg-yellow-600' : 'bg-gray-700'}`}>
            {t === 'members' ? `Membres (${guild.members.length}/10)` :
             t === 'chat' ? 'Chat' : t === 'announce' ? 'Annonces' : 'Donner'}
          </button>
        ))}
      </div>

      {/* Members */}
      {tab === 'members' && (
        <div className="space-y-2">
          {guild.members.map((m: any) => (
            <div key={m.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold">{m.user.displayName || m.user.username}</span>
                <span className="text-xs text-gray-400 ml-2">{ROLE_LABELS[m.role]}</span>
                <div className="text-xs text-gray-500">Elo {m.user.elo} · {m.user.league}</div>
              </div>
              {canManage && m.userId !== user?.id && m.role !== 'LEADER' && (
                <div className="flex gap-1">
                  <button onClick={() => handlePromote(m.userId)} className="text-xs bg-green-700 rounded px-2 py-1">↑</button>
                  <button onClick={() => handleDemote(m.userId)} className="text-xs bg-yellow-700 rounded px-2 py-1">↓</button>
                  <button onClick={() => handleKick(m.userId)} className="text-xs bg-red-700 rounded px-2 py-1">✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat placeholder */}
      {tab === 'chat' && (
        <div>
          <div className="bg-gray-800 rounded-lg p-3 h-64 overflow-y-auto mb-2">
            <p className="text-center text-gray-500 text-sm">Chat en temps reel (Socket.io)</p>
          </div>
          <div className="flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm" placeholder="Message..." />
            <button className="bg-blue-600 rounded px-4 py-2 text-sm">Envoyer</button>
          </div>
        </div>
      )}

      {/* Announcements */}
      {tab === 'announce' && (
        <div>
          {canManage && (
            <div className="flex gap-2 mb-3">
              <input value={announceText} onChange={e => setAnnounceText(e.target.value)}
                className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm" placeholder="Nouvelle annonce..." />
              <button onClick={handleAnnounce} className="bg-blue-600 rounded px-4 py-2 text-sm">Poster</button>
            </div>
          )}
          <div className="space-y-2">
            {guild.announcements.map((a: any) => (
              <div key={a.id} className={`bg-gray-800 rounded-lg p-3 ${a.isPinned ? 'border border-yellow-500' : ''}`}>
                <div className="text-sm">{a.isPinned && '📌 '}{a.content}</div>
                <div className="text-xs text-gray-500 mt-1">{new Date(a.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
            {guild.announcements.length === 0 && <p className="text-center text-gray-500 text-sm">Aucune annonce</p>}
          </div>
        </div>
      )}

      {/* Donate */}
      {tab === 'donate' && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-bold mb-3">Donner au tresor</h3>
          <div className="flex gap-2 mb-3">
            <input type="number" value={donateGold} onChange={e => setDonateGold(e.target.value)}
              className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm" placeholder="Or (max 1000)" />
            <button onClick={handleDonate} className="bg-green-600 rounded px-4 py-2 text-sm">Donner</button>
          </div>
          <p className="text-xs text-gray-500">Cooldown: 24h entre chaque donation</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 space-y-2">
        <button onClick={handleLeave} className="w-full bg-red-700 hover:bg-red-600 rounded py-2 text-sm">
          Quitter la guilde
        </button>
      </div>

      <NavBar />
    </main>
  );
}
