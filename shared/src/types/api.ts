import type { Item } from './item';
import type { User } from './user';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthRequest {
  initData: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  isNewUser: boolean;
}

export interface ChestOpenResponse {
  item: Item;
  chestStock: number;
  nextChestAt: string;
}

export interface EquipRequest {
  itemId: string;
}
