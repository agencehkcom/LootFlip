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
import { marketRouter } from './modules/marketplace/marketplace.routes';
import { shopRouter } from './modules/shop/shop.routes';
import { craftRouter } from './modules/craft/craft.routes';
import { guildRouter } from './modules/guild/guild.routes';
import { friendRouter } from './modules/friend/friend.routes';
import { challengeRouter } from './modules/challenge/challenge.routes';
import { tournamentRouter } from './modules/tournament/tournament.routes';
import { walletRouter } from './modules/wallet/wallet.routes';
import { tokenRouter } from './modules/token/token.routes';
import { stakingRouter } from './modules/staking/staking.routes';
import { governanceRouter } from './modules/governance/governance.routes';
import { raidRouter } from './modules/raid/raid.routes';
import { prestigeRouter } from './modules/prestige/prestige.routes';
import { eventRouter } from './modules/event/event.routes';
import { questRouter } from './modules/quest/quest.routes';
import { referralRouter } from './modules/referral/referral.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { authMiddleware } from './middleware/auth';
import { rateLimit } from './middleware/rateLimit';
import { setupSocket } from './socket';
import { seedShopItems, seedCraftRecipes, updateDynamicPrices, expireListings, expireOffers } from './modules/pricing/pricing.service';
import { resolveWars } from './modules/tournament/tournament.service';
import { expireChallenges } from './modules/challenge/challenge.service';
import { resolveExpiredProposals } from './modules/governance/governance.service';
import { seedBosses, resolveExpiredRaids } from './modules/raid/raid.service';
import { seedEvents } from './modules/event/event.service';

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
app.use('/api/market', authMiddleware, rateLimit(30, 60), marketRouter);
app.use('/api/shop', authMiddleware, rateLimit(20, 60), shopRouter);
app.use('/api/craft', authMiddleware, rateLimit(10, 60), craftRouter);
app.use('/api/guild', authMiddleware, guildRouter);
app.use('/api/friends', authMiddleware, friendRouter);
app.use('/api/challenge', authMiddleware, challengeRouter);
app.use('/api/tournament', authMiddleware, tournamentRouter);
app.use('/api/wallet', authMiddleware, walletRouter);
app.use('/api/token', authMiddleware, tokenRouter);
app.use('/api/staking', authMiddleware, stakingRouter);
app.use('/api/governance', authMiddleware, governanceRouter);
app.use('/api/raid', authMiddleware, raidRouter);
app.use('/api/prestige', authMiddleware, prestigeRouter);
app.use('/api/events', authMiddleware, eventRouter);
app.use('/api/quests', authMiddleware, questRouter);
app.use('/api/referral', authMiddleware, referralRouter);
app.use('/api/analytics', authMiddleware, analyticsRouter);

// Socket.io
setupSocket(io);

// Seed data & start cron jobs
async function bootstrap() {
  await seedShopItems();
  await seedCraftRecipes();
  await seedBosses();
  await seedEvents();

  // Update dynamic prices every hour
  setInterval(async () => {
    await updateDynamicPrices();
    await expireListings();
    await expireOffers();
    await resolveWars();
    await expireChallenges();
    await resolveExpiredProposals();
    await resolveExpiredRaids();
  }, 3_600_000);
}

httpServer.listen(ENV.PORT, async () => {
  await bootstrap();
  console.log(`Server running on port ${ENV.PORT}`);
});

export { app, io };
