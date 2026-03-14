'use client';

interface EquippedItem {
  type: string;
  trait: string;
  rarity: string;
  bonusDamage: number;
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'border-gray-500',
  RARE: 'border-blue-500',
  EPIC: 'border-purple-500',
  LEGENDARY: 'border-yellow-500',
  MYTHIC: 'border-red-500',
};

const SLOT_ICONS: Record<string, string> = {
  WEAPON: '🗡️',
  ARMOR: '🛡️',
  SPELL: '✨',
};

const TRAIT_ICONS: Record<string, string> = {
  BURN: '🔥', FREEZE: '❄️', LIGHTNING: '⚡',
  SHADOW: '👻', HEAL: '💚', POISON: '🧪',
};

export function HeroDisplay({ items }: { items: EquippedItem[] }) {
  const slots = ['WEAPON', 'ARMOR', 'SPELL'];

  return (
    <div className="flex justify-center gap-4 my-6">
      {slots.map(slot => {
        const item = items.find(i => i.type === slot);
        return (
          <div
            key={slot}
            className={`w-20 h-20 rounded-lg border-2 flex flex-col items-center justify-center bg-gray-800 ${
              item ? RARITY_COLORS[item.rarity] : 'border-gray-600 border-dashed'
            }`}
          >
            {item ? (
              <>
                <span className="text-2xl">{SLOT_ICONS[slot]}</span>
                <span className="text-sm">{TRAIT_ICONS[item.trait]}</span>
                <span className="text-xs text-gray-400">+{item.bonusDamage}</span>
              </>
            ) : (
              <span className="text-2xl text-gray-600">{SLOT_ICONS[slot]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
