import { describe, it, expect } from 'vitest';
import { validateEquip } from './item.service';
import { ItemType } from '@lootflip/shared';

describe('item.service', () => {
  describe('validateEquip', () => {
    it('should accept valid equip', () => {
      const item = { type: ItemType.WEAPON, isEquipped: false, ownerId: 'user-1' };
      expect(() => validateEquip(item as any, 'user-1')).not.toThrow();
    });

    it('should reject equipping item owned by another user', () => {
      const item = { type: ItemType.WEAPON, isEquipped: false, ownerId: 'user-2' };
      expect(() => validateEquip(item as any, 'user-1')).toThrow('Not your item');
    });

    it('should reject equipping already equipped item', () => {
      const item = { type: ItemType.WEAPON, isEquipped: true, ownerId: 'user-1' };
      expect(() => validateEquip(item as any, 'user-1')).toThrow('Already equipped');
    });
  });
});
