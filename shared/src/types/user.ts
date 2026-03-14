import type { Item } from './item';

export interface User {
  id: string;
  telegramId: string;
  username: string | null;
  displayName: string | null;
  elo: number;
  trophies: number;
  goldBalance: number;
  gemBalance: number;
  createdAt: string;
}

export interface UserProfile extends User {
  equippedItems: Item[];
  chestStock: number;
  nextChestAt: string | null;
}
