import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface JwtPayload {
  userId: string;
  telegramId: string;
}

export function validateTelegramInitData(initData: string, botToken: string): Record<string, string> | null {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');
  const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash !== hash) return null;

  const result: Record<string, string> = {};
  for (const [k, v] of entries) {
    result[k] = v;
  }
  return result;
}

export function createJwt(payload: JwtPayload, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyJwt(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

export async function authenticateUser(initData: string, botToken: string, jwtSecret: string) {
  const data = validateTelegramInitData(initData, botToken);
  if (!data) throw new Error('Invalid Telegram initData');

  const userData = JSON.parse(data.user || '{}');
  const telegramId = String(userData.id);

  let user = await prisma.user.findUnique({ where: { telegramId } });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await prisma.user.create({
      data: {
        telegramId,
        username: userData.username || null,
        displayName: [userData.first_name, userData.last_name].filter(Boolean).join(' ') || null,
        chestState: {
          create: { stock: 3, nextFreeAt: new Date() },
        },
      },
    });
  }

  const token = createJwt({ userId: user.id, telegramId }, jwtSecret);
  return { token, user, isNewUser };
}
