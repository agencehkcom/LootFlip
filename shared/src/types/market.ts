export enum Currency {
  GOLD = 'GOLD',
  GEM = 'GEM',
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum OfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string | null;
  itemId: string;
  item: import('./item').Item;
  price: number;
  currency: Currency;
  status: ListingStatus;
  offersCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface MarketOffer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string | null;
  offerPrice: number;
  status: OfferStatus;
  expiresAt: string;
  createdAt: string;
}

export interface MarketListingFilters {
  rarity?: import('./item').Rarity;
  trait?: import('./item').ItemTrait;
  type?: import('./item').ItemType;
  currency?: Currency;
  priceMin?: number;
  priceMax?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  page?: number;
  limit?: number;
}
