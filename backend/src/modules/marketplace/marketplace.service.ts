import { PrismaClient } from '@prisma/client';
import { GAME } from '@lootflip/shared';

const prisma = new PrismaClient();

export async function createListing(
  sellerId: string,
  itemId: string,
  price: number,
  currency: 'GOLD' | 'GEM'
) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Item not found');
  if (item.ownerId !== sellerId) throw new Error('Not your item');
  if (item.isEquipped) throw new Error('Unequip item first');
  if (item.isListed) throw new Error('Item already listed');
  if (item.tradeableAt && new Date(item.tradeableAt) > new Date()) {
    throw new Error('Item not yet tradeable');
  }

  // Enforce currency rules: GOLD for Common→Epic, GEM for Legendary/Mythic
  const requiresGem = item.rarity === 'LEGENDARY' || item.rarity === 'MYTHIC';
  if (requiresGem && currency !== 'GEM') {
    throw new Error('Legendary and Mythic items must be listed in GEM');
  }
  if (!requiresGem && currency !== 'GOLD') {
    throw new Error('Common, Rare, and Epic items must be listed in GOLD');
  }

  // Price bounds
  const minPrice = currency === 'GOLD' ? GAME.MARKET_GOLD_PRICE_MIN : GAME.MARKET_GEM_PRICE_MIN;
  const maxPrice = currency === 'GOLD' ? GAME.MARKET_GOLD_PRICE_MAX : GAME.MARKET_GEM_PRICE_MAX;
  if (price < minPrice || price > maxPrice) {
    throw new Error(`Price must be between ${minPrice} and ${maxPrice}`);
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + GAME.MARKET_LISTING_DURATION_DAYS);

  return prisma.$transaction(async (tx) => {
    await tx.item.update({
      where: { id: itemId },
      data: { isListed: true },
    });

    return tx.marketListing.create({
      data: {
        sellerId,
        itemId,
        price,
        currency,
        expiresAt,
      },
      include: {
        item: true,
        seller: { select: { username: true, displayName: true } },
      },
    });
  });
}

export async function searchListings(filters: {
  rarity?: string;
  trait?: string;
  type?: string;
  currency?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const where: any = { status: 'ACTIVE' };

  if (filters.currency) where.currency = filters.currency;
  if (filters.priceMin || filters.priceMax) {
    where.price = {};
    if (filters.priceMin) where.price.gte = filters.priceMin;
    if (filters.priceMax) where.price.lte = filters.priceMax;
  }

  const itemWhere: any = {};
  if (filters.rarity) itemWhere.rarity = filters.rarity;
  if (filters.trait) itemWhere.trait = filters.trait;
  if (filters.type) itemWhere.type = filters.type;
  if (Object.keys(itemWhere).length > 0) {
    where.item = itemWhere;
  }

  const orderBy: any = {};
  switch (filters.sort) {
    case 'price_asc': orderBy.price = 'asc'; break;
    case 'price_desc': orderBy.price = 'desc'; break;
    case 'oldest': orderBy.createdAt = 'asc'; break;
    default: orderBy.createdAt = 'desc'; break;
  }

  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 50);

  const [listings, total] = await Promise.all([
    prisma.marketListing.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        item: true,
        seller: { select: { username: true, displayName: true } },
        _count: { select: { offers: { where: { status: 'PENDING' } } } },
      },
    }),
    prisma.marketListing.count({ where }),
  ]);

  return { listings, total, page, limit };
}

export async function getListingById(id: string) {
  return prisma.marketListing.findUnique({
    where: { id },
    include: {
      item: true,
      seller: { select: { username: true, displayName: true } },
      offers: {
        where: { status: 'PENDING' },
        include: { buyer: { select: { username: true, displayName: true } } },
        orderBy: { offerPrice: 'desc' },
      },
    },
  });
}

export async function buyListing(buyerId: string, listingId: string) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.marketListing.findUnique({
      where: { id: listingId },
      include: { item: true },
    });

    if (!listing) throw new Error('Listing not found');
    if (listing.status !== 'ACTIVE') throw new Error('Listing no longer active');
    if (listing.sellerId === buyerId) throw new Error('Cannot buy your own listing');

    const buyer = await tx.user.findUnique({ where: { id: buyerId } });
    if (!buyer) throw new Error('Buyer not found');

    const balanceField = listing.currency === 'GOLD' ? 'goldBalance' : 'gemBalance';
    if ((buyer as any)[balanceField] < listing.price) {
      throw new Error('Insufficient balance');
    }

    const commission = Math.floor(listing.price * GAME.MARKET_COMMISSION_RATE);
    const sellerReceives = listing.price - commission;

    // Debit buyer
    await tx.user.update({
      where: { id: buyerId },
      data: { [balanceField]: { decrement: listing.price } },
    });

    // Credit seller
    await tx.user.update({
      where: { id: listing.sellerId },
      data: { [balanceField]: { increment: sellerReceives } },
    });

    // Transfer item ownership
    const tradeableAt = new Date();
    tradeableAt.setHours(tradeableAt.getHours() + GAME.MARKET_TRADEABLE_COOLDOWN_HOURS);

    await tx.item.update({
      where: { id: listing.itemId },
      data: {
        ownerId: buyerId,
        isListed: false,
        isEquipped: false,
        tradeableAt,
      },
    });

    // Close listing
    await tx.marketListing.update({
      where: { id: listingId },
      data: { status: 'SOLD' },
    });

    // Reject all pending offers
    await tx.marketOffer.updateMany({
      where: { listingId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });

    return { commission, sellerReceives, item: listing.item };
  });
}

export async function makeOffer(buyerId: string, listingId: string, offerPrice: number) {
  const listing = await prisma.marketListing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error('Listing not found');
  if (listing.status !== 'ACTIVE') throw new Error('Listing no longer active');
  if (listing.sellerId === buyerId) throw new Error('Cannot offer on your own listing');
  if (offerPrice >= listing.price) throw new Error('Offer must be less than listing price');
  if (offerPrice <= 0) throw new Error('Offer must be positive');

  const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
  if (!buyer) throw new Error('Buyer not found');

  const balanceField = listing.currency === 'GOLD' ? 'goldBalance' : 'gemBalance';
  if ((buyer as any)[balanceField] < offerPrice) {
    throw new Error('Insufficient balance');
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + GAME.MARKET_OFFER_DURATION_HOURS);

  return prisma.marketOffer.create({
    data: {
      listingId,
      buyerId,
      offerPrice,
      expiresAt,
    },
  });
}

export async function respondToOffer(
  sellerId: string,
  offerId: string,
  accept: boolean
) {
  const offer = await prisma.marketOffer.findUnique({
    where: { id: offerId },
    include: { listing: { include: { item: true } } },
  });

  if (!offer) throw new Error('Offer not found');
  if (offer.listing.sellerId !== sellerId) throw new Error('Not your listing');
  if (offer.status !== 'PENDING') throw new Error('Offer no longer pending');

  if (!accept) {
    return prisma.marketOffer.update({
      where: { id: offerId },
      data: { status: 'REJECTED' },
    });
  }

  // Accept the offer — works like buyListing but at offer price
  return prisma.$transaction(async (tx) => {
    const buyer = await tx.user.findUnique({ where: { id: offer.buyerId } });
    if (!buyer) throw new Error('Buyer not found');

    const listing = offer.listing;
    const balanceField = listing.currency === 'GOLD' ? 'goldBalance' : 'gemBalance';

    if ((buyer as any)[balanceField] < offer.offerPrice) {
      await tx.marketOffer.update({
        where: { id: offerId },
        data: { status: 'REJECTED' },
      });
      throw new Error('Buyer no longer has sufficient balance');
    }

    const commission = Math.floor(offer.offerPrice * GAME.MARKET_COMMISSION_RATE);
    const sellerReceives = offer.offerPrice - commission;

    await tx.user.update({
      where: { id: offer.buyerId },
      data: { [balanceField]: { decrement: offer.offerPrice } },
    });

    await tx.user.update({
      where: { id: sellerId },
      data: { [balanceField]: { increment: sellerReceives } },
    });

    const tradeableAt = new Date();
    tradeableAt.setHours(tradeableAt.getHours() + GAME.MARKET_TRADEABLE_COOLDOWN_HOURS);

    await tx.item.update({
      where: { id: listing.itemId },
      data: {
        ownerId: offer.buyerId,
        isListed: false,
        isEquipped: false,
        tradeableAt,
      },
    });

    await tx.marketListing.update({
      where: { id: listing.id },
      data: { status: 'SOLD' },
    });

    await tx.marketOffer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
    });

    await tx.marketOffer.updateMany({
      where: { listingId: listing.id, status: 'PENDING', id: { not: offerId } },
      data: { status: 'REJECTED' },
    });

    return { commission, sellerReceives };
  });
}

export async function cancelListing(sellerId: string, listingId: string) {
  const listing = await prisma.marketListing.findUnique({ where: { id: listingId } });
  if (!listing) throw new Error('Listing not found');
  if (listing.sellerId !== sellerId) throw new Error('Not your listing');
  if (listing.status !== 'ACTIVE') throw new Error('Listing not active');

  return prisma.$transaction(async (tx) => {
    await tx.item.update({
      where: { id: listing.itemId },
      data: { isListed: false },
    });

    await tx.marketListing.update({
      where: { id: listingId },
      data: { status: 'CANCELLED' },
    });

    await tx.marketOffer.updateMany({
      where: { listingId, status: 'PENDING' },
      data: { status: 'REJECTED' },
    });
  });
}

export async function getMyListings(userId: string) {
  return prisma.marketListing.findMany({
    where: { sellerId: userId, status: 'ACTIVE' },
    include: {
      item: true,
      _count: { select: { offers: { where: { status: 'PENDING' } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMyOffers(userId: string) {
  return prisma.marketOffer.findMany({
    where: { buyerId: userId },
    include: {
      listing: {
        include: {
          item: true,
          seller: { select: { username: true, displayName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
