'use client';
import { useState } from 'react';
import { HpBar } from './HpBar';
import { Timer } from './Timer';

const TRAIT_ICONS: Record<string, string> = {
  BURN: '🔥', FREEZE: '❄️', LIGHTNING: '⚡',
  SHADOW: '👻', HEAL: '💚', POISON: '🧪',
};

interface BattleArenaProps {
  myHp: number;
  opponentHp: number;
  myUsername: string;
  opponentUsername: string;
  round: number;
  powers: { trait: string; used: boolean }[];
  timerSeconds: number;
  onAction: (action: string, powerIndex: number | null) => void;
  lastResult?: {
    p1Action: string; p2Action: string;
    p1Damage: number; p2Damage: number;
  } | null;
  disabled: boolean;
}

export function BattleArena({
  myHp, opponentHp, myUsername, opponentUsername,
  round, powers, timerSeconds, onAction, lastResult, disabled,
}: BattleArenaProps) {
  const [selectedPower, setSelectedPower] = useState<number | null>(null);

  function handleAction(action: string) {
    if (disabled) return;
    onAction(action, selectedPower);
    setSelectedPower(null);
  }

  return (
    <div className="flex flex-col h-full">
      <HpBar hp={opponentHp} label={opponentUsername} />

      <div className="text-center my-4">
        <div className="text-sm text-gray-400">Round {round}/5</div>
        <Timer seconds={timerSeconds} onTimeout={() => handleAction('ATTACK')} />
      </div>

      {lastResult && (
        <div className="text-center text-sm text-gray-400 mb-4">
          {lastResult.p1Action} vs {lastResult.p2Action}
        </div>
      )}

      <HpBar hp={myHp} label={myUsername} />

      <div className="flex justify-center gap-3 my-4">
        {powers.map((power, idx) => (
          <button
            key={idx}
            disabled={power.used || disabled}
            onClick={() => setSelectedPower(selectedPower === idx ? null : idx)}
            className={`w-12 h-12 rounded-lg border-2 text-xl ${
              power.used
                ? 'bg-gray-800 border-gray-700 opacity-40'
                : selectedPower === idx
                  ? 'bg-yellow-600 border-yellow-400'
                  : 'bg-gray-700 border-gray-600'
            }`}
          >
            {TRAIT_ICONS[power.trait]}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-auto mb-4">
        {[
          { action: 'ATTACK', icon: '⚔️', label: 'Attaque', color: 'bg-red-600' },
          { action: 'DEFEND', icon: '🛡️', label: 'Defense', color: 'bg-blue-600' },
          { action: 'SPELL', icon: '✨', label: 'Sort', color: 'bg-purple-600' },
        ].map(btn => (
          <button
            key={btn.action}
            disabled={disabled}
            onClick={() => handleAction(btn.action)}
            className={`${btn.color} hover:opacity-80 rounded-xl p-4 flex flex-col items-center min-w-[80px] ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="text-2xl">{btn.icon}</span>
            <span className="text-xs mt-1">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
