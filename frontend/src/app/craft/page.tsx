'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'border-gray-500 bg-gray-800', RARE: 'border-blue-500 bg-blue-900/50',
  EPIC: 'border-purple-500 bg-purple-900/50', LEGENDARY: 'border-yellow-500 bg-yellow-900/50',
  MYTHIC: 'border-red-500 bg-red-900/50',
};

const RARITY_ORDER = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
const TYPE_ICONS: Record<string, string> = { WEAPON: '🗡️', ARMOR: '🛡️', SPELL: '✨' };
const TRAIT_ICONS: Record<string, string> = {
  BURN: '🔥', FREEZE: '❄️', LIGHTNING: '⚡', SHADOW: '👻', HEAL: '💚', POISON: '🧪',
};

export default function CraftPage() {
  const [items, setItems] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getInventory(), api.getCraftRecipes()])
      .then(([inv, rec]) => { setItems(inv); setRecipes(rec); })
      .finally(() => setLoading(false));
  }, []);

  const recipe = selectedItem
    ? recipes.find((r: any) => r.fromRarity === selectedItem.rarity)
    : null;

  const availableMaterials = selectedItem
    ? items.filter(i =>
        i.id !== selectedItem.id &&
        i.rarity === selectedItem.rarity &&
        !i.isEquipped &&
        !i.isListed &&
        !selectedMaterials.includes(i.id)
      )
    : [];

  function toggleMaterial(id: string) {
    if (selectedMaterials.includes(id)) {
      setSelectedMaterials(m => m.filter(x => x !== id));
    } else if (recipe && selectedMaterials.length < recipe.materialsRequired) {
      setSelectedMaterials(m => [...m, id]);
    }
  }

  async function handleUpgrade() {
    if (!selectedItem || !recipe) return;
    try {
      const upgraded = await api.upgradeItem(selectedItem.id, selectedMaterials);
      setMessage(`Item ameliore en ${upgraded.rarity} ! +${upgraded.bonusDamage} degats`);
      setSelectedItem(null);
      setSelectedMaterials([]);
      const inv = await api.getInventory();
      setItems(inv);
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  const upgradableItems = items.filter(i =>
    !i.isEquipped && !i.isListed && i.rarity !== 'MYTHIC'
  );

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">🔨 Amelioration</h1>

      {message && (
        <div className="bg-green-900/50 border border-green-500 rounded p-2 mb-4 text-center text-sm">
          {message}
          <button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {/* Recipes overview */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <h2 className="text-sm font-bold mb-2">Recettes</h2>
        <div className="space-y-1">
          {recipes.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between text-xs">
              <span>{r.fromRarity} → {r.toRarity}</span>
              <span className="text-gray-400">{r.materialsRequired} items + {r.goldCost} 🪙</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Chargement...</p>
      ) : !selectedItem ? (
        <>
          <h2 className="text-sm font-bold mb-2">Choisir un item a ameliorer</h2>
          <div className="grid grid-cols-3 gap-2">
            {upgradableItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setSelectedItem(item); setSelectedMaterials([]); }}
                className={`border rounded-lg p-2 text-center ${RARITY_COLORS[item.rarity]}`}
              >
                <div className="text-lg">{TYPE_ICONS[item.type]}{TRAIT_ICONS[item.trait]}</div>
                <div className="text-xs">{item.rarity}</div>
                <div className="text-xs text-gray-400">+{item.bonusDamage}</div>
              </button>
            ))}
          </div>
          {upgradableItems.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-4">Aucun item ameliorable</p>
          )}
        </>
      ) : (
        <>
          {/* Selected item */}
          <div className={`border rounded-lg p-3 mb-4 ${RARITY_COLORS[selectedItem.rarity]}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl">{TYPE_ICONS[selectedItem.type]} {TRAIT_ICONS[selectedItem.trait]}</span>
                <span className="ml-2 font-bold">{selectedItem.rarity}</span>
                <span className="ml-2 text-gray-400">→ {recipe?.toRarity}</span>
              </div>
              <button onClick={() => { setSelectedItem(null); setSelectedMaterials([]); }} className="text-gray-400">✕</button>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Cout: {recipe?.goldCost} 🪙 + {recipe?.materialsRequired} items {selectedItem.rarity}
            </div>
          </div>

          {/* Material selection */}
          <h2 className="text-sm font-bold mb-2">
            Materiaux ({selectedMaterials.length}/{recipe?.materialsRequired})
          </h2>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {availableMaterials.map(item => (
              <button
                key={item.id}
                onClick={() => toggleMaterial(item.id)}
                className={`border rounded-lg p-2 text-center ${
                  selectedMaterials.includes(item.id)
                    ? 'border-green-400 bg-green-900/30'
                    : RARITY_COLORS[item.rarity]
                }`}
              >
                <div className="text-lg">{TYPE_ICONS[item.type]}{TRAIT_ICONS[item.trait]}</div>
                <div className="text-xs">+{item.bonusDamage}</div>
              </button>
            ))}
            {availableMaterials.length === 0 && selectedMaterials.length < (recipe?.materialsRequired || 0) && (
              <p className="col-span-3 text-center text-gray-400 text-xs">
                Pas assez d'items {selectedItem.rarity}
              </p>
            )}
          </div>

          {/* Upgrade button */}
          <button
            onClick={handleUpgrade}
            disabled={selectedMaterials.length !== recipe?.materialsRequired}
            className={`w-full py-3 rounded-lg font-bold text-lg ${
              selectedMaterials.length === recipe?.materialsRequired
                ? 'bg-yellow-600 hover:bg-yellow-500'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Ameliorer ({recipe?.goldCost} 🪙)
          </button>
        </>
      )}

      <NavBar />
    </main>
  );
}
