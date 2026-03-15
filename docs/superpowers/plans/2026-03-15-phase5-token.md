# Phase 5 — Token $GEM (TON)

## Understanding Summary

- **Quoi** : Tokenisation du $GEM sur TON avec wallet, staking, governance, mécanismes déflationnaires
- **Pourquoi** : Donner une valeur réelle aux $GEM, activer le Play-to-Earn
- **Pour qui** : Joueurs existants + nouveaux joueurs P2E
- **Non-goals** : Pas de NFT items, pas de DEX intégré, pas d'ICO

## Architecture

Backend bridge : transactions in-game instantanées, withdraw/deposit on-chain via treasury wallet.
Smart contract Jetton (TEP-74) déployé sur TON testnet.

## Token Economics

- **Supply** : 1B $GEM fixe, pas de mint
- **Distribution** :
  - 50% Play-to-Earn (récompenses saison, distribué progressivement)
  - 20% Staking rewards pool
  - 10% Équipe (vesting 12 mois)
  - 10% Trésorerie / buyback
  - 10% Liquidité DEX

## Mécanismes déflationnaires

- 2% burn sur chaque vente marketplace en $GEM
- 100% burn sur achats shop en $GEM
- Buyback : rachat + burn depuis la trésorerie

## Data Model

```prisma
enum WalletType {
  CUSTODIAL
  EXTERNAL
}

enum TokenTxType {
  WITHDRAW
  DEPOSIT
  BURN
  STAKE
  UNSTAKE
}

enum TokenTxStatus {
  PENDING
  CONFIRMED
  FAILED
}

enum ProposalStatus {
  ACTIVE
  PASSED
  REJECTED
  EXPIRED
}

enum ProposalCategory {
  GAMEPLAY
  CONTENT
  ECONOMY
}

enum BurnSource {
  MARKETPLACE
  SHOP
  BUYBACK
}

model Wallet {
  id           String     @id @default(cuid())
  userId       String     @unique
  user         User       @relation(fields: [userId], references: [id])
  type         WalletType
  address      String
  encryptedKey String?
  connectedAt  DateTime   @default(now())
}

model TokenTransaction {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  type          TokenTxType
  amount        Int
  status        TokenTxStatus @default(PENDING)
  txHash        String?
  walletAddress String
  createdAt     DateTime      @default(now())

  @@index([userId])
}

model StakePosition {
  id           String    @id @default(cuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id])
  amount       Int
  lockDays     Int
  apy          Float
  startedAt    DateTime  @default(now())
  unlocksAt    DateTime
  claimedAt    DateTime?
  rewardAmount Int       @default(0)

  @@index([userId])
}

model GovernanceProposal {
  id             String           @id @default(cuid())
  title          String
  description    String
  category       ProposalCategory
  options        Json
  creatorId      String
  creator        User             @relation(fields: [creatorId], references: [id])
  status         ProposalStatus   @default(ACTIVE)
  startsAt       DateTime         @default(now())
  endsAt         DateTime
  quorumRequired Int
  createdAt      DateTime         @default(now())

  votes GovernanceVote[]
}

model GovernanceVote {
  id          String             @id @default(cuid())
  proposalId  String
  proposal    GovernanceProposal @relation(fields: [proposalId], references: [id])
  userId      String
  user        User               @relation(fields: [userId], references: [id])
  optionIndex Int
  votingPower Int
  createdAt   DateTime           @default(now())

  @@unique([proposalId, userId])
  @@index([proposalId])
}

model BurnRecord {
  id        String     @id @default(cuid())
  amount    Int
  source    BurnSource
  txHash    String?
  createdAt DateTime   @default(now())
}
```

### Modifications existantes
- **User** : `wallet Wallet?`, `stakePositions StakePosition[]`, `tokenTransactions TokenTransaction[]`, `votes GovernanceVote[]`, `proposals GovernanceProposal[]`

## API Routes

### Wallet
```
POST   /api/wallet/create          → Créer wallet custodial
POST   /api/wallet/connect         → Connecter wallet TON Connect
GET    /api/wallet/info             → Infos wallet
POST   /api/wallet/disconnect       → Déconnecter externe
```

### Token
```
POST   /api/token/withdraw          → Retirer $GEM (min 10, max 1000, cooldown 24h)
POST   /api/token/deposit/confirm   → Confirmer dépôt
GET    /api/token/transactions       → Historique
GET    /api/token/stats              → Supply, brûlé, staké
```

### Staking
```
POST   /api/staking/stake            → Staker (amount, lockDays)
POST   /api/staking/unstake/:id      → Unstake après unlock
POST   /api/staking/claim/:id        → Claim rewards
GET    /api/staking/positions         → Mes positions
GET    /api/staking/info              → APY, total staké
```

### Governance
```
POST   /api/governance/propose       → Créer proposition (min 100 GEM stakés)
POST   /api/governance/vote/:id      → Voter (power = GEM stakés)
GET    /api/governance/proposals      → Liste
GET    /api/governance/proposals/:id  → Détail + résultats
```

## Logique métier

### Wallet
- Custodial : keypair Ed25519, clé privée chiffrée AES-256 en DB
- TON Connect : adresse externe stockée, un seul wallet actif
- Withdrawal : 2FA Telegram, min 10, max 1000, cooldown 24h
- Deposit : webhook/poll transactions entrantes sur treasury

### Staking
- 7j → 1% APY, 30j → 3% APY, 90j → 5% APY
- GEM déduites de gemBalance → StakePosition
- Reward = amount * apy * lockDays / 365
- Boosts actifs pendant staking : +1 coffre/jour, +5% or combat

### Governance
- Proposer : min 100 GEM stakés
- Voting power = total GEM en staking
- Quorum 5% du total staké, votes ouverts 72h
- 3 catégories : GAMEPLAY, CONTENT, ECONOMY
- Exécution manuelle par l'équipe

### Burn
- 2% transactions marketplace GEM → BurnRecord
- 100% achats shop GEM → BurnRecord
- Buyback admin → BurnRecord

## Frontend

### Nouvelles pages
- `/wallet` — Wallet, balance, withdraw/deposit
- `/staking` — Positions, stake/unstake/claim, boosts
- `/governance` — Propositions, votes
- `/governance/[id]` — Détail proposition
- `/token` — Dashboard supply, burn, stats

### Nouveaux composants
- WalletCard, WithdrawModal, StakePanel, StakePositionCard
- ProposalCard, VoteModal, BurnTracker, TokenStats

### NavBar
- Hub, Arene, Marche, Guilde, Wallet

## NFR
- Déploiement testnet TON d'abord
- Smart contract Tact (Jetton TEP-74)
- Clé privée custodial chiffrée AES-256
- 2FA Telegram sur withdrawals
- Rate limiting withdrawals
- Cooldown 24h, max 1000/withdrawal

## Decision Log

| # | Décision | Alternatives | Raison |
|---|----------|-------------|--------|
| 1 | TON blockchain | Solana, Base | Natif Telegram |
| 2 | Scope complet | Token seul | Écosystème P2E |
| 3 | Triple burn (marketplace+shop+buyback) | Burn seul | Déflationnaire fort |
| 4 | Staking mix (GEM + boosts) | Rendement seul | Double incentive |
| 5 | APY 1/3/5% | Plus élevé | Pool durable 10+ ans |
| 6 | Governance 3 catégories | Paramètres seuls | Engagement communauté |
| 7 | Custodial + TON Connect | Un seul type | UX + décentralisation |
| 8 | Distribution 50/20/10/10/10 | Autre | Max récompenses joueurs |
| 9 | Backend bridge | Full on-chain | Performance + vrais tokens |
| 10 | Testnet d'abord | Mainnet | Pas de fonds requis |
| 11 | Governance manuelle | Auto on-chain | YAGNI, contrôle |
