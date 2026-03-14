'use client';

export function HpBar({ hp, maxHp = 100, label }: { hp: number; maxHp?: number; label: string }) {
  const pct = Math.max(0, (hp / maxHp) * 100);
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{hp}/{maxHp}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div className={`${color} h-3 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
