'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

const CATEGORY_LABELS: Record<string, string> = {
  CHEST: '📦 Coffres', CONSUMABLE: '🧪 Consommables', COSMETIC: '✨ Cosmetiques',
};

export default function ShopPage() {
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    try { setItems(await api.getShopItems()); } catch {}
    setLoading(false);
  }

  async function handleBuy(item: any) {
    try {
      const result = await api.buyShopItem(item.id);
      if (item.category === 'CHEST') {
        const rarity = result.deliveredItem?.rarity || 'COMMON';
        setMessage(`Coffre ouvert ! Item ${rarity} obtenu !`);
      } else if (item.category === 'CONSUMABLE') {
        setMessage('Potion achetee ! Stock mis a jour.');
      } else {
        setMessage(`Cosmetique "${item.name}" obtenu !`);
      }
      loadItems();
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  const filtered = category ? items.filter(i => i.category === category) : items;
  const grouped = filtered.reduce((acc: Record<string, any[]>, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">🛒 Boutique</h1>

      {message && (
        <div className="bg-green-900/50 border border-green-500 rounded p-2 mb-4 text-center text-sm">
          {message}
          <button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setCategory('')}
          className={`px-3 py-1 rounded text-sm ${!category ? 'bg-yellow-600' : 'bg-gray-700'}`}
        >
          Tout
        </button>
        {['CHEST', 'CONSUMABLE', 'COSMETIC'].map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded text-sm ${category === c ? 'bg-yellow-600' : 'bg-gray-700'}`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Chargement...</p>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="mb-6">
            <h2 className="text-lg font-bold mb-3">{CATEGORY_LABELS[cat]}</h2>
            <div className="grid grid-cols-2 gap-3">
              {catItems.map((item: any) => (
                <div key={item.id} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                  <div className="text-sm font-bold mb-1">{item.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{item.description}</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-400 font-bold">
                      {item.currentPrice} {item.currency === 'GOLD' ? '🪙' : '💎'}
                    </span>
                    {item.isDynamic && item.currentPrice !== item.basePrice && (
                      <span className={`text-xs ${item.currentPrice > item.basePrice ? 'text-red-400' : 'text-green-400'}`}>
                        {item.currentPrice > item.basePrice ? '↑' : '↓'}
                        {Math.abs(Math.round((item.currentPrice / item.basePrice - 1) * 100))}%
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleBuy(item)}
                    className="w-full bg-green-600 hover:bg-green-500 rounded py-1 text-sm"
                  >
                    Acheter
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <NavBar />
    </main>
  );
}
