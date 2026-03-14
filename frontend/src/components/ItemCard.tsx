'use client';

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'bg-gray-700 border-gray-500',
  RARE: 'bg-blue-900 border-blue-500',
  EPIC: 'bg-purple-900 border-purple-500',
  LEGENDARY: 'bg-yellow-900 border-yellow-500',
  MYTHIC: 'bg-red-900 border-red-500',
};

const RARITY_TEXT: Record<string, string> = {
  COMMON: 'text-gray-400',
  RARE: 'text-blue-400',
  EPIC: 'text-purple-400',
  LEGENDARY: 'text-yellow-400',
  MYTHIC: 'text-red-400',
};

const TYPE_ICONS: Record<string, string> = {
  WEAPON: '🗡️', ARMOR: '🛡️', SPELL: '✨',
};

const TRAIT_ICONS: Record<string, string> = {
  BURN: '🔥', FREEZE: '❄️', LIGHTNING: '⚡',
  SHADOW: '👻', HEAL: '💚', POISON: '🧪',
};

interface ItemCardProps {
  item: {
    id: string; type: string; trait: string;
    rarity: string; bonusDamage: number; isEquipped: boolean;
  };
  onEquip?: (id: string) => void;
  onUnequip?: (id: string) => void;
}

export function ItemCard({ item, onEquip, onUnequip }: ItemCardProps) {
  return (
    <div className={`rounded-lg border p-3 ${RARITY_COLORS[item.rarity]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{TYPE_ICONS[item.type]} {TRAIT_ICONS[item.trait]}</span>
        <span className={`text-xs font-bold ${RARITY_TEXT[item.rarity]}`}>{item.rarity}</span>
      </div>
      <div className="text-sm text-gray-300">+{item.bonusDamage} degats</div>
      <div className="mt-2">
        {item.isEquipped ? (
          <button
            onClick={() => onUnequip?.(item.id)}
            className="w-full text-xs bg-gray-600 hover:bg-gray-500 rounded py-1"
          >
            Desequiper
          </button>
        ) : (
          <button
            onClick={() => onEquip?.(item.id)}
            className="w-full text-xs bg-green-600 hover:bg-green-500 rounded py-1"
          >
            Equiper
          </button>
        )}
      </div>
    </div>
  );
}
