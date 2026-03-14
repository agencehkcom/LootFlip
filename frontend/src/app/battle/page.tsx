'use client';
import { useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { BattleArena } from '@/components/BattleArena';
import { NavBar } from '@/components/NavBar';

type Phase = 'idle' | 'searching' | 'fighting' | 'result';

export default function BattlePage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [opponent, setOpponent] = useState<any>(null);
  const [myHp, setMyHp] = useState(100);
  const [opHp, setOpHp] = useState(100);
  const [round, setRound] = useState(1);
  const [timerSec, setTimerSec] = useState(10);
  const [powers, setPowers] = useState<{ trait: string; used: boolean }[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);
  const [actionSent, setActionSent] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const socketRef = useSocket({
    'matchmaking:found': (data: any) => {
      setOpponent(data.opponent);
      setPhase('fighting');
      if (data.opponent.equipment) {
        setPowers(data.opponent.equipment.map((e: any) => ({ trait: e.trait, used: false })));
      }
    },
    'round:start': (data: any) => {
      setRound(data.round);
      setTimerSec(data.timeLimit);
      setActionSent(false);
      setLastResult(null);
    },
    'round:result': (data: any) => {
      setMyHp(data.p1Hp);
      setOpHp(data.p2Hp);
      setLastResult(data);
    },
    'battle:end': (data: any) => {
      setWinnerId(data.winnerId);
      setPhase('result');
    },
  });

  const startSearch = useCallback(() => {
    setPhase('searching');
    socketRef.current?.emit('matchmaking:join', { goldStake: 100 });
  }, [socketRef]);

  const cancelSearch = useCallback(() => {
    setPhase('idle');
    socketRef.current?.emit('matchmaking:cancel');
  }, [socketRef]);

  const sendAction = useCallback((action: string, powerIndex: number | null) => {
    if (actionSent) return;
    setActionSent(true);
    socketRef.current?.emit('round:action', { action, powerIndex });
  }, [actionSent, socketRef]);

  return (
    <div className="pb-20 px-4 pt-4 min-h-screen flex flex-col">
      {phase === 'idle' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-6xl mb-6">⚔️</span>
          <h1 className="text-xl font-bold mb-4">Arene</h1>
          <button
            onClick={startSearch}
            className="bg-red-600 hover:bg-red-500 px-8 py-3 rounded-lg font-bold text-lg"
          >
            Trouver un adversaire
          </button>
        </div>
      )}

      {phase === 'searching' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-pulse text-4xl mb-4">🔍</div>
          <p className="text-gray-400 mb-4">Recherche d&apos;un adversaire...</p>
          <button onClick={cancelSearch} className="text-sm text-gray-500 underline">
            Annuler
          </button>
        </div>
      )}

      {phase === 'fighting' && (
        <BattleArena
          myHp={myHp}
          opponentHp={opHp}
          myUsername="Toi"
          opponentUsername={opponent?.username || 'Adversaire'}
          round={round}
          powers={powers}
          timerSeconds={timerSec}
          onAction={sendAction}
          lastResult={lastResult}
          disabled={actionSent}
        />
      )}

      {phase === 'result' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-6xl mb-4">{winnerId ? '🏆' : '🤝'}</span>
          <h2 className="text-2xl font-bold mb-2">
            {winnerId ? 'Victoire !' : 'Match nul'}
          </h2>
          <p className="text-gray-400 mb-6">
            {myHp} HP vs {opHp} HP
          </p>
          <button
            onClick={() => { setPhase('idle'); setMyHp(100); setOpHp(100); }}
            className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded-lg"
          >
            Rejouer
          </button>
        </div>
      )}

      <NavBar />
    </div>
  );
}
