import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ENV } from './config/env';
import { authRouter } from './modules/auth/auth.routes';
import { userRouter } from './modules/user/user.routes';
import { chestRouter } from './modules/chest/chest.routes';
import { itemRouter } from './modules/item/item.routes';
import { battleRouter } from './modules/battle/battle.routes';
import { seasonRouter } from './modules/season/season.routes';
import { authMiddleware } from './middleware/auth';
import { rateLimit } from './middleware/rateLimit';
import { setupSocket } from './socket';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/user', authMiddleware, userRouter);
app.use('/api/chest', authMiddleware, rateLimit(10, 60), chestRouter);
app.use('/api/inventory', authMiddleware, itemRouter);
app.use('/api/battle', authMiddleware, rateLimit(30, 60), battleRouter);
app.use('/api/season', authMiddleware, seasonRouter);

// Socket.io
setupSocket(io);

httpServer.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
});

export { app, io };
