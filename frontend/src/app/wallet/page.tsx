'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'wallet' | 'transactions' | 'stats'>('wallet');

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try { setWallet(await api.getWalletInfo()); } catch { setWallet(null); }
    try { setTransactions(await api.getTokenTransactions()); } catch {}
    try { setStats(await api.getTokenStats()); } catch {}
    setLoading(false);
  }

  async function handleCreateWallet() {
    try {
      await api.createWallet();
      setMessage('Wallet cree !');
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleWithdraw() {
    if (!withdrawAmount) return;
    try {
      await api.withdrawGem(Number(withdrawAmount));
      setMessage('Retrait effectue !');
      setWithdrawAmount('');
      loadAll();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleDisconnect() {
    try {
      await api.disconnectWallet();
      setMessage('Wallet deconnecte');
      setWallet(null);
    } catch (e: any) { setMessage(e.message); }
  }

  if (loading) return <main className="min-h-screen bg-gray-900 text-white p-4 pb-20"><p className="text-center text-gray-400">Chargement...</p><NavBar /></main>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-20">
      <h1 className="text-2xl font-bold text-center mb-4">💎 Wallet $GEM</h1>

      {message && (
        <div className="bg-blue-900/50 border border-blue-500 rounded p-2 mb-4 text-center text-sm">
          {message}<button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {/* Quick links */}
      <div className="flex gap-2 mb-4">
        <Link href="/staking" className="flex-1 bg-purple-600 hover:bg-purple-500 text-center py-2 rounded text-sm font-medium">
          📈 Staking
        </Link>
        <Link href="/governance" className="flex-1 bg-blue-600 hover:bg-blue-500 text-center py-2 rounded text-sm font-medium">
          🗳️ Governance
        </Link>
        <Link href="/token" className="flex-1 bg-green-600 hover:bg-green-500 text-center py-2 rounded text-sm font-medium">
          📊 Stats
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['wallet', 'transactions', 'stats'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded text-sm ${tab === t ? 'bg-yellow-600' : 'bg-gray-700'}`}>
            {t === 'wallet' ? 'Wallet' : t === 'transactions' ? 'Historique' : 'Token'}
          </button>
        ))}
      </div>

      {tab === 'wallet' && (
        <>
          {!wallet ? (
            <div className="text-center">
              <p className="text-gray-400 mb-4">Aucun wallet connecte</p>
              <button onClick={handleCreateWallet}
                className="w-full bg-yellow-600 hover:bg-yellow-500 rounded py-3 font-bold mb-2">
                Creer un wallet (custodial)
              </button>
              <p className="text-xs text-gray-500">Ou connecte un wallet externe via TON Connect</p>
            </div>
          ) : (
            <div>
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="text-xs text-gray-400 mb-1">Adresse</div>
                <div className="text-sm font-mono break-all mb-3">{wallet.address}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{wallet.inGameBalance}</div>
                    <div className="text-xs text-gray-400">In-game 💎</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{wallet.onChainBalance}</div>
                    <div className="text-xs text-gray-400">On-chain 💎</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">Type: {wallet.type}</div>
              </div>

              {/* Withdraw */}
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-bold mb-2">Retirer des $GEM</h3>
                <div className="flex gap-2">
                  <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                    className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm" placeholder="Min 10, Max 1000" />
                  <button onClick={handleWithdraw} className="bg-red-600 hover:bg-red-500 rounded px-4 py-2 text-sm">
                    Retirer
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Cooldown 24h entre retraits</p>
              </div>

              {wallet.type === 'EXTERNAL' && (
                <button onClick={handleDisconnect} className="w-full bg-gray-700 rounded py-2 text-sm">
                  Deconnecter wallet
                </button>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'transactions' && (
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400">Aucune transaction</p>
          ) : transactions.map((tx: any) => (
            <div key={tx.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className={`text-sm font-bold ${tx.type === 'DEPOSIT' ? 'text-green-400' : tx.type === 'WITHDRAW' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {tx.type}
                </span>
                <div className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount} 💎</div>
                <div className={`text-xs ${tx.status === 'CONFIRMED' ? 'text-green-400' : tx.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {tx.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'stats' && stats && (
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">{(stats.totalSupply / 1e6).toFixed(0)}M</div>
                <div className="text-xs text-gray-400">Supply total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{(stats.circulatingSupply / 1e6).toFixed(0)}M</div>
                <div className="text-xs text-gray-400">En circulation</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{stats.totalBurned}</div>
                <div className="text-xs text-gray-400">Total brule</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">{stats.totalStaked}</div>
                <div className="text-xs text-gray-400">Total stake</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <NavBar />
    </main>
  );
}
