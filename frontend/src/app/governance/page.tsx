'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

const CATEGORY_ICONS: Record<string, string> = { GAMEPLAY: '🎮', CONTENT: '🎨', ECONOMY: '💰' };

export default function GovernancePage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GAMEPLAY');
  const [options, setOptions] = useState(['', '']);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProposals(); }, [filter]);

  async function loadProposals() {
    setLoading(true);
    try { setProposals(await api.getProposals(filter)); } catch {}
    setLoading(false);
  }

  async function handleCreate() {
    const validOptions = options.filter(o => o.trim());
    if (!title.trim() || validOptions.length < 2) {
      setMessage('Titre et au moins 2 options requis');
      return;
    }
    try {
      await api.createProposal(title, description, category, validOptions);
      setMessage('Proposition creee !');
      setShowCreate(false);
      setTitle(''); setDescription(''); setOptions(['', '']);
      loadProposals();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleVote(proposalId: string, optionIndex: number) {
    try {
      await api.voteOnProposal(proposalId, optionIndex);
      setMessage('Vote enregistre !');
      loadProposals();
    } catch (e: any) { setMessage(e.message); }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-center mb-4">🗳️ Governance</h1>

      {message && (
        <div className="bg-blue-900/50 border border-blue-500 rounded p-2 mb-4 text-center text-sm">
          {message}<button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['', 'ACTIVE', 'PASSED', 'EXPIRED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-1 rounded text-xs ${filter === f ? 'bg-yellow-600' : 'bg-gray-700'}`}>
            {f || 'Toutes'}
          </button>
        ))}
      </div>

      {/* Create button */}
      <button onClick={() => setShowCreate(!showCreate)}
        className="w-full bg-purple-600 hover:bg-purple-500 rounded py-2 text-sm font-bold mb-4">
        + Proposer (min 100 GEM stakees)
      </button>

      {/* Create form */}
      {showCreate && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm mb-2" placeholder="Titre" />
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm mb-2 h-20" placeholder="Description" />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm mb-2">
            <option value="GAMEPLAY">🎮 Gameplay</option>
            <option value="CONTENT">🎨 Contenu</option>
            <option value="ECONOMY">💰 Economie</option>
          </select>
          {options.map((opt, i) => (
            <input key={i} value={opt} onChange={e => {
              const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts);
            }} className="w-full bg-gray-700 rounded px-3 py-2 text-sm mb-1" placeholder={`Option ${i + 1}`} />
          ))}
          <button onClick={() => setOptions([...options, ''])} className="text-xs text-blue-400 mb-2">+ Option</button>
          <button onClick={handleCreate} className="w-full bg-green-600 rounded py-2 text-sm">Soumettre</button>
        </div>
      )}

      {/* Proposals list */}
      {loading ? (
        <p className="text-center text-gray-400">Chargement...</p>
      ) : proposals.length === 0 ? (
        <p className="text-center text-gray-400">Aucune proposition</p>
      ) : (
        <div className="space-y-3">
          {proposals.map((p: any) => {
            const opts = p.options as string[];
            const totalPower = p.totalVotes || 1;
            const isActive = p.status === 'ACTIVE';
            const hoursLeft = Math.max(0, Math.ceil((new Date(p.endsAt).getTime() - Date.now()) / 3600000));

            return (
              <div key={p.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">{CATEGORY_ICONS[p.category]} {p.title}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    p.status === 'ACTIVE' ? 'bg-green-700' :
                    p.status === 'PASSED' ? 'bg-blue-700' : 'bg-gray-600'
                  }`}>{p.status}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{p.description}</p>

                {/* Options with vote bars */}
                <div className="space-y-2">
                  {opts.map((opt: string, i: number) => {
                    const power = p.results[i] || 0;
                    const pct = totalPower > 0 ? Math.round(power / totalPower * 100) : 0;
                    return (
                      <button key={i} onClick={() => isActive && handleVote(p.id, i)}
                        disabled={!isActive}
                        className={`w-full text-left rounded p-2 text-sm ${isActive ? 'hover:bg-gray-600' : ''} bg-gray-700`}>
                        <div className="flex justify-between mb-1">
                          <span>{opt}</span>
                          <span className="text-xs text-gray-400">{pct}% ({power})</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-1">
                          <div className="bg-yellow-500 rounded-full h-1" style={{ width: `${pct}%` }} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isActive && (
                  <div className="text-xs text-gray-500 mt-2">⏳ {hoursLeft}h restantes · Quorum: {p.quorumRequired} votes</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <NavBar />
    </main>
  );
}
