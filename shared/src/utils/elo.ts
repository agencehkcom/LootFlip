const K_FACTOR = 32;

export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  result: 'win' | 'loss' | 'draw'
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actualScore = result === 'win' ? 1 : result === 'loss' ? 0 : 0.5;
  return Math.round(K_FACTOR * (actualScore - expectedScore));
}
