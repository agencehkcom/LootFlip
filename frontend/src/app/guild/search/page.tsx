'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

export default function GuildSearchPage() {
  const router = useRouter();
  const [guilds, setGuilds] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { search(); }, []);

  async function search() {
    setLoading(true);
    try { setGuilds(await api.searchGuilds(query)); } catch {}
    setLoading(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await api.createGuild(newName, newDesc);
      router.push('/guild');
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleJoin(guildId: string) {
    try {
      await api.joinGuild(guildId);
      router.push('/guild');
    } catch (e: any) { setMessage(e.message); }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-center mb-4">🔍 Trouver une guilde</h1>

      {message && (
        <div className="bg-red-900/50 border border-red-500 rounded p-2 mb-4 text-center text-sm">
          {message}<button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input value={query} onChange={e => setQuery(e.target.value)}
          className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm" placeholder="Nom de guilde..." />
        <button onClick={search} className="bg-blue-600 rounded px-4 py-2 text-sm">Chercher</button>
      </div>

      {/* Create toggle */}
      <button onClick={() => setShowCreate(!showCreate)}
        className="w-full bg-yellow-600 hover:bg-yellow-500 rounded py-2 text-sm font-bold mb-4">
        + Creer une guilde (500 🪙)
      </button>

      {showCreate && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <input value={newName} onChange={e => setNewName(e.target.value)}
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm mb-2" placeholder="Nom de la guilde" />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)}
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm mb-2" placeholder="Description (optionnel)" />
          <button onClick={handleCreate} className="w-full bg-green-600 rounded py-2 text-sm">Creer</button>
        </div>
      )}

      {/* Results */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-center text-gray-400">Chargement...</p>
        ) : guilds.length === 0 ? (
          <p className="text-center text-gray-400">Aucune guilde trouvee</p>
        ) : guilds.map((g: any) => (
          <div key={g.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="font-bold">{g.name}</div>
              <div className="text-xs text-gray-400">🏆 {g.trophies} · {g._count.members}/10 membres</div>
            </div>
            <button onClick={() => handleJoin(g.id)}
              className="bg-green-600 hover:bg-green-500 rounded px-4 py-1 text-sm">
              Rejoindre
            </button>
          </div>
        ))}
      </div>

      <NavBar />
    </main>
  );
}
