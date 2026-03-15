import type { Currency } from './market';

export enum ShopCategory {
  CHEST = 'CHEST',
  CONSUMABLE = 'CONSUMABLE',
  COSMETIC = 'COSMETIC',
}

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  description: string;
  basePrice: number;
  currency: Currency;
  currentPrice: number;
  isDynamic: boolean;
  metadata: Record<string, unknown> | null;
}

export interface PriceHistoryEntry {
  price: number;
  recordedAt: string;
}
