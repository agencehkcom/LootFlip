import { describe, it, expect } from 'vitest';
import { createJwt, verifyJwt } from './auth.service';

describe('auth.service', () => {
  const TEST_JWT_SECRET = 'test-jwt-secret';

  it('should create and verify a JWT', () => {
    const token = createJwt({ userId: 'user-1', telegramId: '12345' }, TEST_JWT_SECRET);
    const payload = verifyJwt(token, TEST_JWT_SECRET);
    expect(payload.userId).toBe('user-1');
    expect(payload.telegramId).toBe('12345');
  });

  it('should reject invalid JWT', () => {
    expect(() => verifyJwt('invalid-token', TEST_JWT_SECRET)).toThrow();
  });
});
