import { describe, it, expect } from 'vitest';
import { calculateEloChange } from './elo';

describe('calculateEloChange', () => {
  it('win against equal opponent gives ~+16', () => {
    const change = calculateEloChange(1000, 1000, 'win');
    expect(change).toBe(16);
  });

  it('loss against equal opponent gives ~-16', () => {
    const change = calculateEloChange(1000, 1000, 'loss');
    expect(change).toBe(-16);
  });

  it('draw against equal opponent gives 0', () => {
    const change = calculateEloChange(1000, 1000, 'draw');
    expect(change).toBe(0);
  });

  it('win against stronger opponent gives more', () => {
    const change = calculateEloChange(1000, 1400, 'win');
    expect(change).toBeGreaterThan(20);
  });

  it('loss against stronger opponent gives less penalty', () => {
    const change = calculateEloChange(1000, 1400, 'loss');
    expect(change).toBeGreaterThan(-10);
  });

  it('win against weaker opponent gives less', () => {
    const change = calculateEloChange(1400, 1000, 'win');
    expect(change).toBeLessThan(10);
  });
});
