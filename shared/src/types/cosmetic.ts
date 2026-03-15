export enum CosmeticType {
  TITLE = 'TITLE',
  FRAME = 'FRAME',
  EFFECT = 'EFFECT',
}

export interface Cosmetic {
  id: string;
  ownerId: string;
  type: CosmeticType;
  name: string;
  metadata: Record<string, unknown> | null;
  equippedAt: string | null;
  createdAt: string;
}
