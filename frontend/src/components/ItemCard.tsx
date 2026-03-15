'use client';

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'bg-gray-700/80 border-gray-500',
  RARE: 'bg-blue-900/80 border-blue-500',
  EPIC: 'bg-purple-900/80 border-purple-500',
  LEGENDARY: 'bg-yellow-900/80 border-yellow-500',
  MYTHIC: 'bg-red-900/80 border-red-500',
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
    id: string; name?: string; description?: string;
    type: string; trait: string;
    rarity: string; bonusDamage: number; isEquipped: boolean;
  };
  onEquip?: (id: string) => void;
  onUnequip?: (id: string) => void;
  compact?: boolean;
}

export function ItemCard({ item, onEquip, onUnequip, compact }: ItemCardProps) {
  if (compact) {
    return (
      <div className={`rounded-lg border p-2 ${RARITY_COLORS[item.rarity]}`}>
        <div className="flex items-center gap-1">
          <span>{TYPE_ICONS[item.type]}{TRAIT_ICONS[item.trait]}</span>
          <span className={`text-xs font-bold ${RARITY_TEXT[item.rarity]}`}>+{item.bonusDamage}</span>
        </div>
        {item.name && <div className="text-xs font-medium truncate mt-1">{item.name}</div>}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-3 ${RARITY_COLORS[item.rarity]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xl">{TYPE_ICONS[item.type]} {TRAIT_ICONS[item.trait]}</span>
        <span className={`text-xs font-bold ${RARITY_TEXT[item.rarity]}`}>{item.rarity}</span>
      </div>
      {item.name && (
        <div className="font-bold text-sm mb-1">{item.name}</div>
      )}
      {item.description && (
        <div className="text-xs text-gray-400 mb-2 italic">{item.description}</div>
      )}
      <div className="text-sm text-gray-300 mb-2">+{item.bonusDamage} degats</div>
      <div>
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
