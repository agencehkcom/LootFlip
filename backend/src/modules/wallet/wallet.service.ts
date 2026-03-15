import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || 'dev_encryption_key_32_bytes_long!';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function createCustodialWallet(userId: string) {
  const existing = await prisma.wallet.findUnique({ where: { userId } });
  if (existing) throw new Error('Wallet already exists');

  // Generate a simulated TON keypair (in production, use @ton/crypto)
  const privateKey = crypto.randomBytes(32).toString('hex');
  const address = 'EQ' + crypto.randomBytes(32).toString('hex').slice(0, 48);

  const encryptedKey = encrypt(privateKey);

  return prisma.wallet.create({
    data: {
      userId,
      type: 'CUSTODIAL',
      address,
      encryptedKey,
    },
  });
}

export async function connectExternalWallet(userId: string, address: string) {
  const existing = await prisma.wallet.findUnique({ where: { userId } });

  if (existing) {
    return prisma.wallet.update({
      where: { userId },
      data: { type: 'EXTERNAL', address, encryptedKey: null, connectedAt: new Date() },
    });
  }

  return prisma.wallet.create({
    data: { userId, type: 'EXTERNAL', address },
  });
}

export async function getWalletInfo(userId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return {
    id: wallet.id,
    type: wallet.type,
    address: wallet.address,
    onChainBalance: 0, // TODO: query TON blockchain
    inGameBalance: user?.gemBalance || 0,
    connectedAt: wallet.connectedAt,
  };
}

export async function disconnectWallet(userId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new Error('No wallet connected');
  if (wallet.type !== 'EXTERNAL') throw new Error('Cannot disconnect custodial wallet');

  return prisma.wallet.delete({ where: { userId } });
}
