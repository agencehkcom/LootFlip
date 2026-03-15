# Phase 4 — Social / Guildes

## Understanding Summary

- **Quoi** : Système social complet — guildes, amis, défis 1v1, guerres, tournois, donations, chat
- **Pourquoi** : Rétention et engagement — créer des liens sociaux et une dimension collective
- **Pour qui** : Joueurs existants de Loot Flip Arena
- **Non-goals** : Pas de messaging privé, pas de voix/vidéo, pas d'alliances entre guildes

## Architecture

4 nouveaux modules backend : `guild/`, `friend/`, `challenge/`, `tournament/`
Chat de guilde via Socket.io rooms. Guerres et tournois gérés par crons.

## Data Model

### Nouveaux modèles

```prisma
enum GuildRole {
  LEADER
  CO_LEADER
  OFFICER
  MEMBER
}

enum WarStatus {
  PENDING
  ACTIVE
  COMPLETED
}

enum TournamentStatus {
  REGISTERING
  ACTIVE
  COMPLETED
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  REJECTED
}

enum ChallengeStatus {
  PENDING
  ACCEPTED
  DECLINED
  COMPLETED
}

model Guild {
  id            String   @id @default(cuid())
  name          String   @unique
  description   String   @default("")
  leaderId      String
  goldTreasury  Int      @default(0)
  gemTreasury   Int      @default(0)
  trophies      Int      @default(0)
  createdAt     DateTime @default(now())

  members       GuildMember[]
  announcements GuildAnnouncement[]
  donations     GuildDonation[]
  chatMessages  GuildChatMessage[]
  warsAsChallenger GuildWar[] @relation("WarChallenger")
  warsAsDefender   GuildWar[] @relation("WarDefender")
  guildItems    Item[]   @relation("GuildItems")
}

model GuildMember {
  id       String    @id @default(cuid())
  guildId  String
  guild    Guild     @relation(fields: [guildId], references: [id])
  userId   String    @unique
  user     User      @relation(fields: [userId], references: [id])
  role     GuildRole @default(MEMBER)
  joinedAt DateTime  @default(now())

  @@unique([guildId, userId])
  @@index([guildId])
}

model GuildAnnouncement {
  id        String   @id @default(cuid())
  guildId   String
  guild     Guild    @relation(fields: [guildId], references: [id])
  authorId  String
  content   String
  isPinned  Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([guildId])
}

model GuildDonation {
  id         String   @id @default(cuid())
  guildId    String
  guild      Guild    @relation(fields: [guildId], references: [id])
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  goldAmount Int      @default(0)
  gemAmount  Int      @default(0)
  itemId     String?
  createdAt  DateTime @default(now())

  @@index([guildId])
  @@index([userId])
}

model GuildWar {
  id                String    @id @default(cuid())
  challengerGuildId String
  challengerGuild   Guild     @relation("WarChallenger", fields: [challengerGuildId], references: [id])
  defenderGuildId   String
  defenderGuild     Guild     @relation("WarDefender", fields: [defenderGuildId], references: [id])
  status            WarStatus @default(PENDING)
  challengerWins    Int       @default(0)
  defenderWins      Int       @default(0)
  winnerId          String?
  startsAt          DateTime?
  endsAt            DateTime?
  createdAt         DateTime  @default(now())

  @@index([challengerGuildId])
  @@index([defenderGuildId])
}

model GuildTournament {
  id        String           @id @default(cuid())
  weekStart DateTime         @unique
  bracket   Json
  status    TournamentStatus @default(REGISTERING)
  winnerId  String?
  createdAt DateTime         @default(now())
}

model GuildChatMessage {
  id        String   @id @default(cuid())
  guildId   String
  guild     Guild    @relation(fields: [guildId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  content   String
  createdAt DateTime @default(now())

  @@index([guildId, createdAt])
}

model Friendship {
  id          String           @id @default(cuid())
  requesterId String
  requester   User             @relation("FriendshipRequester", fields: [requesterId], references: [id])
  receiverId  String
  receiver    User             @relation("FriendshipReceiver", fields: [receiverId], references: [id])
  status      FriendshipStatus @default(PENDING)
  createdAt   DateTime         @default(now())

  @@unique([requesterId, receiverId])
  @@index([receiverId])
}

model RecentOpponent {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation("UserRecentOpponents", fields: [userId], references: [id])
  opponentId String
  opponent   User     @relation("OpponentOf", fields: [opponentId], references: [id])
  battleId   String
  foughtAt   DateTime @default(now())

  @@unique([userId, opponentId])
  @@index([userId])
}

model Challenge {
  id            String          @id @default(cuid())
  challengerId  String
  challenger    User            @relation("ChallengesSent", fields: [challengerId], references: [id])
  challengedId  String
  challenged    User            @relation("ChallengesReceived", fields: [challengedId], references: [id])
  goldStake     Int
  status        ChallengeStatus @default(PENDING)
  battleId      String?
  expiresAt     DateTime
  createdAt     DateTime        @default(now())

  @@index([challengerId])
  @@index([challengedId])
}
```

### Modifications existantes

- **User** : `guildMember GuildMember?`, `friendshipsRequested Friendship[]`, `friendshipsReceived Friendship[]`, `recentOpponents RecentOpponent[]`, `challengesSent Challenge[]`, `challengesReceived Challenge[]`, `guildDonations GuildDonation[]`, `guildChatMessages GuildChatMessage[]`
- **Item** : `guildId String?`, `guild Guild? @relation("GuildItems")`

## API Routes

### Guild

```
POST   /api/guild/create           → Créer une guilde (name, description) — coûte 500 or
GET    /api/guild/:id              → Détail guilde
PUT    /api/guild/:id              → Modifier guilde (chef/co-chef)
DELETE /api/guild/:id              → Dissoudre (chef only)
POST   /api/guild/:id/join         → Demander à rejoindre
POST   /api/guild/:id/leave        → Quitter
POST   /api/guild/:id/kick         → Kick (officier+)
POST   /api/guild/:id/promote      → Promouvoir (chef/co-chef)
POST   /api/guild/:id/demote       → Rétrograder (chef/co-chef)
POST   /api/guild/:id/donate       → Donner or/gem/item
GET    /api/guild/search            → Rechercher des guildes
GET    /api/guild/leaderboard       → Classement guildes
POST   /api/guild/:id/announce     → Poster annonce (officier+)
PUT    /api/guild/announce/:id     → Épingler/désépingler
DELETE /api/guild/announce/:id     → Supprimer annonce
```

### Friends

```
GET    /api/friends                 → Liste d'amis
GET    /api/friends/requests        → Demandes reçues
POST   /api/friends/request         → Envoyer demande
POST   /api/friends/respond         → Accepter/refuser
DELETE /api/friends/:id             → Supprimer ami
GET    /api/friends/recent          → 20 derniers adversaires
```

### Challenge

```
POST   /api/challenge/send          → Défier un ami (goldStake)
POST   /api/challenge/:id/respond   → Accepter/refuser
GET    /api/challenge/pending        → Défis en attente
```

### War & Tournament

```
POST   /api/guild/:id/war/declare   → Déclarer guerre (chef)
POST   /api/guild/war/:id/respond   → Accepter/refuser
GET    /api/guild/war/:id            → Statut guerre
GET    /api/tournament/current       → Tournoi en cours
POST   /api/tournament/register      → Inscrire guilde (500 or trésor)
```

### Socket Events

```
Client → Server:
  guild:chat:send        → { content }
  challenge:send         → { friendId, goldStake }

Server → Client:
  guild:chat:message     → { userId, username, content, createdAt }
  guild:chat:history     → { messages[] }
  challenge:received     → { challengerId, username, goldStake }
  challenge:accepted     → { battleId }
  war:started            → { warId, opponentGuild }
  war:update             → { challengerWins, defenderWins }
  war:ended              → { winnerId, rewards }
  tournament:update      → { bracket }
```

## Logique métier

### Guilde
- Création : 500 or, créateur = Chef
- Max 10 membres
- Succession si Chef quitte : Co-Chef > Officier > Membre (le plus ancien)
- Dissolution : trésor redistribué au prorata de l'ancienneté

### Donations
- Cooldown 24h
- Plafonds : 1000 or / 50 gem / 1 item par donation
- Items vont dans le coffre de guilde (Chef/Co-Chef distribue)
- Or/Gem vont dans le trésor

### Guerres
- Déclarée par Chef, 24h pour accepter
- Durée : 24h
- Victoire PvP membre vs membre adverse = +1 point
- Gagnant : +50 trophées guilde, +100 or par participant gagnant
- Max 1 guerre active par guilde

### Tournois
- Inscription lundi→mercredi, coûte 500 or du trésor
- Bracket puissance de 2 (8/16/32)
- Chaque round = 24h (même système que guerres)
- Récompenses : 1er = +200 trophées + 2000 or, 2e = +100 + 1000, demi-finalistes = +50 + 500

### Amis & Défis
- Demande expire après 7 jours
- Récents : après PvP non-bot, ajout mutuel (max 20, FIFO)
- Défi : mise d'or libre, les deux acceptent, expire 5 min
- Combat défi = ranked sans Elo/trophées

## Frontend

### Nouvelles pages
- `/guild` — Page guilde complète
- `/guild/search` — Recherche/création
- `/guild/war` — Guerre en cours
- `/guild/tournament` — Bracket tournoi
- `/friends` — Amis, demandes, récents, défis

### Nouveaux composants
- GuildCard, GuildChat, GuildMemberList, DonationModal
- WarScoreboard, TournamentBracket
- FriendCard, ChallengeModal, RecentOpponents

### NavBar
- Hub, Arene, Marche, Guilde, Social

## NFR
- Jusqu'à 1 000 guildes actives
- Chat historique 7 jours
- Max 50 amis, 20 récents
- Rate limiting chat
- Validation rôles server-side

## Decision Log

| # | Décision | Alternatives | Raison |
|---|----------|-------------|--------|
| 1 | Guildes max 10 | 30, 50 | Escouade compacte |
| 2 | 4 rôles | 2-3 rôles | Granularité suffisante |
| 3 | Amis bidirectionnel + récents | Follow, récents seuls | Classique, engageant |
| 4 | Défis mise d'or libre | Sans enjeu, choix | Sink d'or social |
| 5 | Guerres 24h + tournois hebdo | Auto, tournois seuls | Variété |
| 6 | Trophées guilde + or participants | Gemmes, items | Prestige + motivation |
| 7 | Donations or+gem+item plafonnées | Or seul | Complet mais contrôlé |
| 8 | Chat Socket.io + annonces | Chat seul | Live + persistant |
| 9 | Modules séparés | Monolithe | Testable, maintenable |
| 10 | Tournoi payant 500 or trésor | Gratuit | Utilité trésor |
| 11 | Défi expire 5 min | 24h, 1h | Anti-spam |
