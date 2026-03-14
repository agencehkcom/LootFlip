'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ItemCard } from '@/components/ItemCard';
import { HeroDisplay } from '@/components/HeroDisplay';
import { NavBar } from '@/components/NavBar';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const data = await api.getInventory();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEquip(itemId: string) {
    await api.equip(itemId);
    await loadItems();
  }

  async function handleUnequip(itemId: string) {
    await api.unequip(itemId);
    await loadItems();
  }

  const equipped = items.filter(i => i.isEquipped);
  const unequipped = items.filter(i => !i.isEquipped);

  return (
    <div className="pb-20 px-4 pt-4">
      <h1 className="text-xl font-bold mb-4">Inventaire</h1>

      <HeroDisplay items={equipped} />

      <h2 className="text-sm text-gray-400 mb-2 mt-6">
        Items ({unequipped.length})
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {unequipped.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onEquip={handleEquip}
            onUnequip={handleUnequip}
          />
        ))}
      </div>

      {unequipped.length === 0 && (
        <p className="text-center text-gray-500 mt-8">Aucun item. Ouvre des coffres !</p>
      )}

      <NavBar />
    </div>
  );
}
