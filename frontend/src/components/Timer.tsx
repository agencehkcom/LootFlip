'use client';
import { useState, useEffect } from 'react';

export function Timer({ seconds, onTimeout }: { seconds: number; onTimeout: () => void }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { onTimeout(); clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const color = timeLeft > 5 ? 'text-white' : 'text-red-400';

  return (
    <div className={`text-center text-2xl font-bold ${color}`}>
      {timeLeft}s
    </div>
  );
}
