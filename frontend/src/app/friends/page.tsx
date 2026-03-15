'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

type Tab = 'friends' | 'requests' | 'recent' | 'challenges';

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [recents, setRecents] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [challengeStake, setChallengeStake] = useState('');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try { setFriends(await api.getFriends()); } catch {}
    try { setRequests(await api.getFriendRequests()); } catch {}
    try { setRecents(await api.getRecentOpponents()); } catch {}
    try { setChallenges(await api.getPendingChallenges()); } catch {}
  }

  async function handleAcceptFriend(id: string) {
    try {
      await api.respondToFriendRequest(id, true);
      setMessage('Ami accepte !');
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleRejectFriend(id: string) {
    try {
      await api.respondToFriendRequest(id, false);
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleRemoveFriend(id: string) {
    try {
      await api.removeFriend(id);
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleAddFriend(userId: string) {
    try {
      await api.sendFriendRequest(userId);
      setMessage('Demande envoyee !');
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleChallenge(friendId: string) {
    const stake = prompt('Mise en or ?');
    if (!stake) return;
    try {
      await api.sendChallenge(friendId, Number(stake));
      setMessage('Defi envoye !');
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleRespondChallenge(id: string, accept: boolean) {
    try {
      await api.respondToChallenge(id, accept);
      setMessage(accept ? 'Defi accepte !' : 'Defi refuse');
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-center mb-4">👥 Social</h1>

      {message && (
        <div className="bg-blue-900/50 border border-blue-500 rounded p-2 mb-4 text-center text-sm">
          {message}<button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(['friends', 'requests', 'recent', 'challenges'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded text-xs font-medium ${tab === t ? 'bg-yellow-600' : 'bg-gray-700'}`}>
            {t === 'friends' ? `Amis (${friends.length})` :
             t === 'requests' ? `Demandes (${requests.length})` :
             t === 'recent' ? 'Recents' : `Defis (${challenges.length})`}
          </button>
        ))}
      </div>

      {/* Friends */}
      {tab === 'friends' && (
        <div className="space-y-2">
          {friends.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">Aucun ami. Combats pour en rencontrer !</p>
          ) : friends.map((f: any) => (
            <div key={f.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="font-bold">{f.friend.displayName || f.friend.username}</span>
                <div className="text-xs text-gray-400">Elo {f.friend.elo} · {f.friend.league}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleChallenge(f.friend.id)}
                  className="text-xs bg-yellow-600 rounded px-3 py-1">⚔️ Defi</button>
                <button onClick={() => handleRemoveFriend(f.id)}
                  className="text-xs bg-red-700 rounded px-2 py-1">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friend requests */}
      {tab === 'requests' && (
        <div className="space-y-2">
          {requests.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">Aucune demande</p>
          ) : requests.map((r: any) => (
            <div key={r.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
              <span className="font-bold">{r.requester.displayName || r.requester.username}</span>
              <div className="flex gap-1">
                <button onClick={() => handleAcceptFriend(r.id)}
                  className="text-xs bg-green-600 rounded px-3 py-1">Accepter</button>
                <button onClick={() => handleRejectFriend(r.id)}
                  className="text-xs bg-red-700 rounded px-3 py-1">Refuser</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent opponents */}
      {tab === 'recent' && (
        <div className="space-y-2">
          {recents.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">Aucun adversaire recent</p>
          ) : recents.map((r: any) => (
            <div key={r.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="font-bold">{r.displayName || r.username}</span>
                <div className="text-xs text-gray-400">Elo {r.elo} · {r.league}</div>
              </div>
              {r.isFriend ? (
                <span className="text-xs text-green-400">Deja ami</span>
              ) : (
                <button onClick={() => handleAddFriend(r.opponentId)}
                  className="text-xs bg-blue-600 rounded px-3 py-1">+ Ajouter</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Challenges */}
      {tab === 'challenges' && (
        <div className="space-y-2">
          {challenges.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">Aucun defi en cours</p>
          ) : challenges.map((c: any) => (
            <div key={c.id} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">
                  {c.challenger.displayName || c.challenger.username} vs {c.challenged.displayName || c.challenged.username}
                </span>
                <span className="text-yellow-400 font-bold">{c.goldStake} 🪙</span>
              </div>
              <div className="text-xs text-gray-400 mb-2">
                Expire {new Date(c.expiresAt).toLocaleTimeString()}
              </div>
              {c.challengedId && (
                <div className="flex gap-2">
                  <button onClick={() => handleRespondChallenge(c.id, true)}
                    className="flex-1 bg-green-600 rounded py-1 text-sm">Accepter</button>
                  <button onClick={() => handleRespondChallenge(c.id, false)}
                    className="flex-1 bg-red-600 rounded py-1 text-sm">Refuser</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <NavBar />
    </main>
  );
}
