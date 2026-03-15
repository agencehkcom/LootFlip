'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ItemCard } from '@/components/ItemCard';
import { NavBar } from '@/components/NavBar';

export default function ChestPage() {
  const [stock, setStock] = useState(0);
  const [nextChestAt, setNextChestAt] = useState<string | null>(null);
  const [lastItem, setLastItem] = useState<any>(null);
  const [opening, setOpening] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    api.getUser().then(profile => {
      setStock(profile.chestStock);
      setNextChestAt(profile.nextChestAt);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!nextChestAt || stock >= 5) return;
    const interval = setInterval(() => {
      const diff = new Date(nextChestAt).getTime() - Date.now();
      if (diff <= 0) {
        setStock(s => Math.min(s + 1, 5));
        setNextChestAt(null);
        clearInterval(interval);
      } else {
        const min = Math.floor(diff / 60000);
        const sec = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${min}:${sec.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextChestAt, stock]);

  async function openChest() {
    if (stock <= 0 || opening) return;
    setOpening(true);
    setLastItem(null);
    try {
      const result = await api.openChest();
      setLastItem(result.item);
      setStock(result.chestStock);
      setNextChestAt(result.nextChestAt);
    } catch (err) {
      console.error(err);
    }
    setOpening(false);
  }

  return (
    <div className="pb-20 px-4 pt-4 min-h-screen text-white relative">
      <div className="fixed inset-0 -z-10">
        <img src="/assets/backgrounds/bg-chest.png" alt="" className="w-full h-full object-cover" />
      </div>

      <h1 className="text-xl font-bold mb-4">Coffres</h1>

      <div className="text-center mb-6">
        <div className="mb-4">
          <img
            src="/assets/items/chest-standard.png"
            alt="Coffre"
            className={`w-40 h-40 mx-auto object-contain ${opening ? 'animate-bounce' : ''}`}
          />
        </div>
        <div className="text-lg mb-2">{stock}/5 coffres disponibles</div>
        {stock < 5 && nextChestAt && (
          <div className="text-sm text-gray-400">Prochain dans {timeLeft}</div>
        )}
      </div>

      <button
        onClick={openChest}
        disabled={stock <= 0 || opening}
        className={`w-full py-3 rounded-lg font-bold text-lg mb-6 ${
          stock > 0 && !opening
            ? 'bg-yellow-600 hover:bg-yellow-500'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {opening ? 'Ouverture...' : `Ouvrir un coffre (${stock})`}
      </button>

      {lastItem && (
        <div className="mb-4">
          <h2 className="text-sm text-gray-400 mb-2">Item obtenu :</h2>
          <ItemCard item={lastItem} onEquip={(id) => api.equip(id)} />
        </div>
      )}

      <NavBar />
    </div>
  );
}
