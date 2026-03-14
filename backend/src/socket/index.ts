import { Server } from 'socket.io';
import { verifyJwt } from '../modules/auth/auth.service';
import { ENV } from '../config/env';
import { setupBattleSocket } from '../modules/battle/battle.socket';

export function setupSocket(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Missing token'));
    try {
      const payload = verifyJwt(token, ENV.JWT_SECRET);
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  setupBattleSocket(io);
}
