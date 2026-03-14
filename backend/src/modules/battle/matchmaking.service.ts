export interface MatchmakingEntry {
  userId: string;
  elo: number;
  goldStake: number;
  socketId: string;
  joinedAt: number;
}

const queue: MatchmakingEntry[] = [];

export function findMatch(
  player: MatchmakingEntry,
  searchQueue: MatchmakingEntry[],
  eloRange: number
): MatchmakingEntry | null {
  for (const entry of searchQueue) {
    if (entry.userId === player.userId) continue;
    if (Math.abs(entry.elo - player.elo) <= eloRange) {
      return entry;
    }
  }
  return null;
}

export function addToQueue(entry: MatchmakingEntry) {
  queue.push(entry);
}

export function removeFromQueue(userId: string): MatchmakingEntry | undefined {
  const idx = queue.findIndex(e => e.userId === userId);
  if (idx === -1) return undefined;
  return queue.splice(idx, 1)[0];
}

export function getQueue(): MatchmakingEntry[] {
  return queue;
}
