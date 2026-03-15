'use client';
import { useState, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { BattleArena } from '@/components/BattleArena';
import { NavBar } from '@/components/NavBar';

type Phase = 'idle' | 'searching' | 'fighting' | 'result';

const LEAGUE_ICONS: Record<string, string> = {
  BRONZE: '🥉', SILVER: '🥈', GOLD: '🥇', DIAMOND: '💎', LEGEND: '👑',
};

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
  const [battleResult, setBattleResult] = useState<any>(null);
  const [matchInfo, setMatchInfo] = useState<any>(null);

  const socketRef = useSocket({
    'matchmaking:found': (data: any) => {
      setOpponent(data.opponent);
      setMatchInfo({ goldStake: data.goldStake, league: data.league, isBotMatch: data.isBotMatch });
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
      setBattleResult(data);
      setPhase('result');
    },
  });

  const startSearch = useCallback(() => {
    setPhase('searching');
    socketRef.current?.emit('matchmaking:join', {});
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

  const resetBattle = () => {
    setPhase('idle');
    setMyHp(100);
    setOpHp(100);
    setBattleResult(null);
    setMatchInfo(null);
  };

  return (
    <div className="pb-20 px-4 pt-4 min-h-screen flex flex-col relative">
      <div className="fixed inset-0 -z-10">
        <img src="/assets/backgrounds/bg-battle.png" alt="" className="w-full h-full object-cover" />
      </div>
      {phase === 'idle' && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-6xl mb-6">⚔️</span>
          <h1 className="text-xl font-bold mb-4">Arene</h1>
          <p className="text-gray-400 text-sm mb-6">
            Mise automatique selon ta ligue
          </p>
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
          <p className="text-gray-500 text-xs mb-4">Un bot sera propose apres 60s</p>
          <button onClick={cancelSearch} className="text-sm text-gray-500 underline">
            Annuler
          </button>
        </div>
      )}

      {phase === 'fighting' && (
        <>
          {matchInfo && (
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>{LEAGUE_ICONS[matchInfo.league]} {matchInfo.league}</span>
              <span>{matchInfo.goldStake} GOLD en jeu</span>
              {matchInfo.isBotMatch && <span className="text-yellow-400">vs Bot</span>}
            </div>
          )}
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
        </>
      )}

      {phase === 'result' && battleResult && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <span className="text-6xl mb-4">
            {battleResult.winnerId ? '🏆' : '🤝'}
          </span>
          <h2 className="text-2xl font-bold mb-2">
            {battleResult.winnerId ? 'Victoire !' : 'Match nul'}
          </h2>
          <p className="text-gray-400 mb-2">
            {battleResult.p1FinalHp} HP vs {battleResult.p2FinalHp} HP
          </p>
          <div className="flex gap-4 text-sm mb-6">
            {battleResult.eloChange !== 0 && (
              <span className={battleResult.eloChange > 0 ? 'text-green-400' : 'text-red-400'}>
                {battleResult.eloChange > 0 ? '+' : ''}{battleResult.eloChange} Elo
              </span>
            )}
            {battleResult.rewards?.gold > 0 && (
              <span className="text-yellow-400">
                {battleResult.winnerId ? '+' : '-'}{battleResult.rewards.gold} GOLD
              </span>
            )}
            {battleResult.isBotMatch && (
              <span className="text-gray-500">vs Bot</span>
            )}
          </div>
          <button
            onClick={resetBattle}
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
