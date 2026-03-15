# Phase 3 — Économie & Marketplace

## Understanding Summary

- **Quoi** : Système économique complet — Marketplace P2P, Shop, Craft
- **Pourquoi** : Donner de la valeur aux $GOLD/$GEM, créer des sinks, préparer la tokenisation Phase 5
- **Pour qui** : Joueurs existants de Loot Flip Arena (Telegram Mini App)
- **Non-goals** : Pas d'enchères temps réel, pas de trading direct, pas de token on-chain

## Architecture

4 nouveaux modules backend : `marketplace/`, `shop/`, `craft/`, `pricing/`
Le module `pricing/` est un service partagé qui recalcule les prix dynamiques toutes les heures.

## Data Model

### Nouveaux modèles

```prisma
enum Currency {
  GOLD
  GEM
}

enum ListingStatus {
  ACTIVE
  SOLD
  CANCELLED
  EXPIRED
}

enum OfferStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}

enum ShopCategory {
  CHEST
  CONSUMABLE
  COSMETIC
}

enum CosmeticType {
  TITLE
  FRAME
  EFFECT
}

model MarketListing {
  id         String        @id @default(cuid())
  seller     User          @relation("UserListings", fields: [sellerId], references: [id])
  sellerId   String
  item       Item          @relation(fields: [itemId], references: [id])
  itemId     String        @unique
  price      Int
  currency   Currency
  status     ListingStatus @default(ACTIVE)
  offers     MarketOffer[]
  expiresAt  DateTime
  createdAt  DateTime      @default(now())
}

model MarketOffer {
  id          String      @id @default(cuid())
  listing     MarketListing @relation(fields: [listingId], references: [id])
  listingId   String
  buyer       User        @relation("UserOffers", fields: [buyerId], references: [id])
  buyerId     String
  offerPrice  Int
  status      OfferStatus @default(PENDING)
  expiresAt   DateTime
  createdAt   DateTime    @default(now())
}

model ShopItem {
  id           String       @id @default(cuid())
  category     ShopCategory
  name         String
  description  String
  basePrice    Int
  currency     Currency
  currentPrice Int
  isDynamic    Boolean      @default(false)
  metadata     Json?
  purchases    Purchase[]
  priceHistory PriceHistory[]
  createdAt    DateTime     @default(now())
}

model Purchase {
  id         String   @id @default(cuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  shopItem   ShopItem @relation(fields: [shopItemId], references: [id])
  shopItemId String
  pricePaid  Int
  currency   Currency
  createdAt  DateTime @default(now())
}

model PriceHistory {
  id         String   @id @default(cuid())
  shopItem   ShopItem @relation(fields: [shopItemId], references: [id])
  shopItemId String
  price      Int
  recordedAt DateTime @default(now())
}

model Cosmetic {
  id         String       @id @default(cuid())
  owner      User         @relation(fields: [ownerId], references: [id])
  ownerId    String
  type       CosmeticType
  name       String
  metadata   Json?
  equippedAt DateTime?
  createdAt  DateTime     @default(now())
}

model CraftRecipe {
  id                String @id @default(cuid())
  fromRarity        Rarity
  toRarity          Rarity
  goldCost          Int
  materialsRequired Int
}
```

### Modifications existantes

- **User** : `cosmetics Cosmetic[]`, `purchases Purchase[]`, `listings MarketListing[]`, `offers MarketOffer[]`, `potionCount Int @default(0)`
- **Item** : `listing MarketListing?`
- **Battle** : `potionUsedP1 Boolean @default(false)`, `potionUsedP2 Boolean @default(false)`

## API Routes

### Marketplace

```
POST   /api/market/list              → Créer un listing (itemId, price, currency)
GET    /api/market/listings          → Rechercher (filtres: rarity, trait, type, currency, priceMin, priceMax, sort)
GET    /api/market/listings/:id      → Détail d'un listing
POST   /api/market/buy/:id           → Achat immédiat
POST   /api/market/offer/:id         → Faire une offre
POST   /api/market/offer/:id/respond → Accepter/refuser (vendeur)
DELETE /api/market/listings/:id      → Annuler son listing
GET    /api/market/my-listings       → Mes listings actifs
GET    /api/market/my-offers         → Mes offres en cours
```

### Shop

```
GET    /api/shop/items               → Catalogue avec prix courants
POST   /api/shop/buy/:id             → Acheter
GET    /api/shop/prices/history/:id  → Historique des prix (30j)
```

### Craft

```
GET    /api/craft/recipes            → Recettes disponibles
POST   /api/craft/upgrade            → Upgrader un item (itemId, materialIds[])
```

### Inventaire (ajout)

```
GET    /api/inventory/cosmetics          → Mes cosmétiques
POST   /api/inventory/cosmetics/equip    → Équiper
POST   /api/inventory/cosmetics/unequip  → Déséquiper
```

## Socket Events (combat — potion)

```
Client → Server:
  use_potion    → { battleId }

Server → Client:
  potion_used   → { playerId, newHp }
  potion_failed → { reason }
```

## Logique métier

### Marketplace
- Item marqué `listed` → non utilisable en combat
- Achat : transaction atomique (transfert monnaie + propriété + commission 5%)
- Offre : vendeur a 24h pour répondre, sinon expiration
- Listing expire après 7 jours
- Prix min : 10 or / 1 gem — Prix max : 100 000 or / 10 000 gem
- Cooldown 24h avant qu'un item soit tradeable
- Currency : Or pour Common→Epic, Gemmes pour Legendary/Mythic

### Shop — Prix dynamiques
- `currentPrice = basePrice * demandMultiplier`
- `demandMultiplier` = achats 24h / moyenne historique
- Bornes : x0.5 (plancher) à x2.0 (plafond)
- Recalcul toutes les heures via cron
- Cosmétiques : prix fixes (pas dynamiques)

### Craft — Table d'upgrade

| De → Vers           | Or    | Items sacrifiés |
|----------------------|-------|-----------------|
| Common → Rare       | 200   | 2               |
| Rare → Epic         | 500   | 4               |
| Epic → Legendary    | 2000  | 8               |
| Legendary → Mythic  | 5000  | 16              |

L'item garde son trait et son type. Seuls rareté et bonusDamage changent.

### Potion de soin
- Stock sur le profil (`potionCount`)
- 1 usage max par combat
- +20 HP (cappé à STARTING_HP = 100)
- Achetable dans le shop (prix dynamique, base ~50 or)

## Frontend

### Nouvelles pages
- `/market` — Marketplace avec filtres et listings
- `/market/[id]` — Détail listing + offres
- `/market/my` — Mes listings et offres
- `/shop` — Catalogue avec prix dynamiques et tendances
- `/craft` — Interface d'upgrade d'items

### Nouveaux composants
- `MarketCard.tsx` — Card listing
- `OfferModal.tsx` — Modal offre
- `ShopItemCard.tsx` — Card shop avec tendance ↑↓
- `PriceChart.tsx` — Mini graphe prix 30j
- `CraftPanel.tsx` — Interface craft
- `CosmeticCard.tsx` — Card cosmétique
- `PotionButton.tsx` — Bouton potion en combat

### NavBar
- Ajout : Marché, Shop
- Craft accessible depuis l'inventaire

## NFR
- Jusqu'à 10 000 listings actifs
- Recherche marketplace < 200ms
- Transactions atomiques
- Prix dynamiques recalculés /1h
- Historique prix conservé 30 jours
- Rate limiting sur achats
- Validation 100% server-side
- Anti-abus : cooldown 24h, commission 5%, prix min/max

## Decision Log

| # | Décision | Alternatives | Raison |
|---|----------|-------------|--------|
| 1 | Marketplace prix fixe + offres | Enchères, trade direct | Simplicité/flexibilité |
| 2 | Or Common→Epic, Gemmes Leg/Mythic | Tout or, tout gem | Demande $GEM pré-token |
| 3 | Coffres premium 2 tiers | Tier unique | Double sink |
| 4 | Potion de soin uniquement | Multi-consommables | YAGNI, anti pay-to-win |
| 5 | Cosmétiques titres+cadres+effets | Titres seuls | Variété sans impact gameplay |
| 6 | Commission 5% flat | Progressive, 10% | Simple, suffisant |
| 7 | Cooldown 24h universel | 48h, variable | Anti-flip sans frustration |
| 8 | Prix dynamiques coffres+conso, fixes cosm | Tout dynamique | Prestige stable |
| 9 | Craft = upgrade (garde trait) | Fusion aléatoire | Attachement, double sink |
| 10 | Matériaux 2-4-8-16 | Linéaire | Mythic vraiment rare |
| 11 | Modules séparés + pricing centralisé | Monolithe, event-driven | Testable, adapté au volume |
