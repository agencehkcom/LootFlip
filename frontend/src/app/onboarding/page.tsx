'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const SLIDES = [
  { title: 'Bienvenue dans Loot Flip Arena !', description: 'Un jeu PvP ou tu combats pour du loot et des $GEM.', icon: '⚔️' },
  { title: 'Combat Chifoumi', description: 'Attaque bat Sort, Sort bat Defense, Defense bat Attaque. Simple mais strategique !', icon: '🎯' },
  { title: 'Equipe-toi', description: 'Ouvre des coffres, equipe des items avec des pouvoirs speciaux (Feu, Glace, Foudre...).', icon: '🗡️' },
  { title: 'Gagne des $GEM', description: 'Monte en ligue, gagne des saisons, et retire tes $GEM en vrais tokens !', icon: '💎' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  async function completeTutorial() {
    try {
      await api.completeTutorial();
    } catch {}
    router.push('/');
  }

  function handleNext() {
    if (step < SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      completeTutorial();
    }
  }

  const slide = SLIDES[step];

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="text-8xl mb-8">{slide.icon}</div>
      <h1 className="text-2xl font-bold text-center mb-4">{slide.title}</h1>
      <p className="text-gray-400 text-center mb-8 max-w-sm">{slide.description}</p>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full ${i === step ? 'bg-yellow-400' : 'bg-gray-600'}`} />
        ))}
      </div>

      <button onClick={handleNext}
        className="w-full max-w-xs bg-yellow-600 hover:bg-yellow-500 rounded-lg py-3 font-bold text-lg">
        {step < SLIDES.length - 1 ? 'Suivant' : 'Commencer !'}
      </button>

      {step > 0 && (
        <button onClick={() => setStep(step - 1)}
          className="mt-3 text-gray-400 text-sm">
          Retour
        </button>
      )}

      {step < SLIDES.length - 1 && (
        <button onClick={completeTutorial}
          className="mt-3 text-gray-500 text-xs">
          Passer
        </button>
      )}
    </main>
  );
}
