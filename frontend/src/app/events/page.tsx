'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

const EVENT_ICONS: Record<string, string> = {
  DOUBLE_DROP: '📦', DOUBLE_GOLD: '🪙', BOSS_WORLD: '🐉',
  FLASH_TOURNAMENT: '⚡', TRAIT_BOOST: '🔥',
};

export default function EventsPage() {
  const [active, setActive] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [message, setMessage] = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try { setActive(await api.getActiveEvents()); } catch {}
    try { setHistory(await api.getEventHistory()); } catch {}
  }

  async function handleParticipate(id: string) {
    try {
      await api.participateEvent(id);
      setMessage('Inscrit a l\'event !');
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleClaim(id: string) {
    try {
      await api.claimEventReward(id);
      setMessage('Rewards reclames !');
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-center mb-4">🎉 Events</h1>

      {message && (
        <div className="bg-blue-900/50 border border-blue-500 rounded p-2 mb-4 text-center text-sm">
          {message}<button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('active')}
          className={`flex-1 py-2 rounded text-sm ${tab === 'active' ? 'bg-yellow-600' : 'bg-gray-700'}`}>
          Actifs ({active.length})
        </button>
        <button onClick={() => setTab('history')}
          className={`flex-1 py-2 rounded text-sm ${tab === 'history' ? 'bg-yellow-600' : 'bg-gray-700'}`}>
          Historique
        </button>
      </div>

      {tab === 'active' && (
        <div className="space-y-3">
          {active.length === 0 ? (
            <p className="text-center text-gray-400">Aucun event en cours</p>
          ) : active.map(event => {
            const hoursLeft = Math.max(0, Math.ceil((new Date(event.endsAt).getTime() - Date.now()) / 3600000));
            return (
              <div key={event.id} className="bg-gray-800 border border-yellow-500 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-lg">{EVENT_ICONS[event.type]} {event.name}</h2>
                  <span className="text-xs bg-green-700 px-2 py-1 rounded">ACTIF</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{event.description}</p>
                <div className="text-xs text-gray-500 mb-3">⏳ {hoursLeft}h restantes</div>
                <button onClick={() => handleParticipate(event.id)}
                  className="w-full bg-green-600 hover:bg-green-500 rounded py-2 text-sm font-bold">
                  Participer
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-center text-gray-400">Aucun event passe</p>
          ) : history.map(event => (
            <div key={event.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold">{EVENT_ICONS[event.type]} {event.name}</span>
                <span className="text-xs text-gray-400">{new Date(event.endsAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{event.description}</p>
            </div>
          ))}
        </div>
      )}

      <NavBar />
    </main>
  );
}
