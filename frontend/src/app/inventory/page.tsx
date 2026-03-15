'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ItemCard } from '@/components/ItemCard';
import { HeroDisplay } from '@/components/HeroDisplay';
import { NavBar } from '@/components/NavBar';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [cosmetics, setCosmetics] = useState<any[]>([]);
  const [tab, setTab] = useState<'items' | 'cosmetics'>('items');
  const [message, setMessage] = useState('');
  const [sellItem, setSellItem] = useState<any>(null);
  const [sellPrice, setSellPrice] = useState('');

  useEffect(() => { loadItems(); loadCosmetics(); }, []);

  async function loadItems() {
    try { setItems(await api.getInventory()); } catch {}
  }

  async function loadCosmetics() {
    try { setCosmetics(await api.getCosmetics()); } catch {}
  }

  async function handleEquip(itemId: string) {
    await api.equip(itemId);
    await loadItems();
  }

  async function handleUnequip(itemId: string) {
    await api.unequip(itemId);
    await loadItems();
  }

  async function handleSell() {
    if (!sellItem || !sellPrice) return;
    const requiresGem = sellItem.rarity === 'LEGENDARY' || sellItem.rarity === 'MYTHIC';
    try {
      await api.createListing(sellItem.id, Number(sellPrice), requiresGem ? 'GEM' : 'GOLD');
      setMessage('Item mis en vente !');
      setSellItem(null);
      setSellPrice('');
      await loadItems();
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  async function handleEquipCosmetic(id: string) {
    await api.equipCosmetic(id);
    await loadCosmetics();
  }

  async function handleUnequipCosmetic(id: string) {
    await api.unequipCosmetic(id);
    await loadCosmetics();
  }

  const equipped = items.filter(i => i.isEquipped);
  const unequipped = items.filter(i => !i.isEquipped && !i.isListed);

  return (
    <div className="pb-20 px-4 pt-4 min-h-screen bg-gray-900 text-white">
      <h1 className="text-xl font-bold mb-4">Inventaire</h1>

      {message && (
        <div className="bg-blue-900/50 border border-blue-500 rounded p-2 mb-4 text-center text-sm">
          {message}
          <button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('items')}
          className={`flex-1 py-2 rounded text-sm ${tab === 'items' ? 'bg-yellow-600' : 'bg-gray-700'}`}
        >
          Items ({items.length})
        </button>
        <button
          onClick={() => setTab('cosmetics')}
          className={`flex-1 py-2 rounded text-sm ${tab === 'cosmetics' ? 'bg-yellow-600' : 'bg-gray-700'}`}
        >
          Cosmetiques ({cosmetics.length})
        </button>
      </div>

      {tab === 'items' && (
        <>
          <HeroDisplay items={equipped} />

          {/* Quick actions */}
          <div className="flex gap-2 mt-4 mb-4">
            <Link href="/craft" className="flex-1 bg-purple-600 hover:bg-purple-500 text-center py-2 rounded text-sm font-medium">
              🔨 Ameliorer
            </Link>
            <Link href="/chest" className="flex-1 bg-blue-600 hover:bg-blue-500 text-center py-2 rounded text-sm font-medium">
              🎁 Coffres
            </Link>
          </div>

          {/* Sell modal */}
          {sellItem && (
            <div className="bg-gray-800 border border-yellow-500 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">Vendre: {sellItem.rarity} {sellItem.trait}</span>
                <button onClick={() => setSellItem(null)} className="text-gray-400">✕</button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={sellPrice}
                  onChange={e => setSellPrice(e.target.value)}
                  placeholder={`Prix en ${sellItem.rarity === 'LEGENDARY' || sellItem.rarity === 'MYTHIC' ? 'GEM' : 'OR'}`}
                  className="flex-1 bg-gray-700 rounded px-2 py-1 text-sm"
                />
                <button onClick={handleSell} className="bg-green-600 hover:bg-green-500 rounded px-4 py-1 text-sm">
                  Vendre
                </button>
              </div>
            </div>
          )}

          <h2 className="text-sm text-gray-400 mb-2 mt-2">Items ({unequipped.length})</h2>
          <div className="grid grid-cols-2 gap-3">
            {unequipped.map(item => (
              <div key={item.id}>
                <ItemCard item={item} onEquip={handleEquip} onUnequip={handleUnequip} />
                <button
                  onClick={() => { setSellItem(item); setSellPrice(''); }}
                  className="w-full mt-1 text-xs bg-yellow-700 hover:bg-yellow-600 rounded py-1"
                >
                  🏪 Vendre
                </button>
              </div>
            ))}
          </div>

          {unequipped.length === 0 && (
            <p className="text-center text-gray-500 mt-8">Aucun item. Ouvre des coffres !</p>
          )}
        </>
      )}

      {tab === 'cosmetics' && (
        <div className="space-y-3">
          {cosmetics.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">Aucun cosmetique. Visite le shop !</p>
          ) : cosmetics.map(c => (
            <div key={c.id} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold">{c.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{c.type}</span>
                </div>
                {c.equippedAt ? (
                  <button
                    onClick={() => handleUnequipCosmetic(c.id)}
                    className="text-xs bg-gray-600 hover:bg-gray-500 rounded px-3 py-1"
                  >
                    Retirer
                  </button>
                ) : (
                  <button
                    onClick={() => handleEquipCosmetic(c.id)}
                    className="text-xs bg-green-600 hover:bg-green-500 rounded px-3 py-1"
                  >
                    Equiper
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <NavBar />
    </div>
  );
}
