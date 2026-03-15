import { Router, Request, Response } from 'express';
import * as marketService from './marketplace.service';

export const marketRouter = Router();

marketRouter.post('/list', async (req: Request, res: Response) => {
  try {
    const { itemId, price, currency } = req.body;
    const listing = await marketService.createListing(req.user!.userId, itemId, price, currency);
    res.json({ success: true, data: listing });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

marketRouter.get('/listings', async (req: Request, res: Response) => {
  try {
    const result = await marketService.searchListings({
      rarity: req.query.rarity as string,
      trait: req.query.trait as string,
      type: req.query.type as string,
      currency: req.query.currency as string,
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      sort: req.query.sort as string,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

marketRouter.get('/listings/:id', async (req: Request, res: Response) => {
  try {
    const listing = await marketService.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    res.json({ success: true, data: listing });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

marketRouter.post('/buy/:id', async (req: Request, res: Response) => {
  try {
    const result = await marketService.buyListing(req.user!.userId, req.params.id);
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

marketRouter.post('/offer/:id', async (req: Request, res: Response) => {
  try {
    const { offerPrice } = req.body;
    const offer = await marketService.makeOffer(req.user!.userId, req.params.id, offerPrice);
    res.json({ success: true, data: offer });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

marketRouter.post('/offer/:id/respond', async (req: Request, res: Response) => {
  try {
    const { accept } = req.body;
    const result = await marketService.respondToOffer(req.user!.userId, req.params.id, accept);
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

marketRouter.delete('/listings/:id', async (req: Request, res: Response) => {
  try {
    await marketService.cancelListing(req.user!.userId, req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

marketRouter.get('/my-listings', async (req: Request, res: Response) => {
  try {
    const listings = await marketService.getMyListings(req.user!.userId);
    res.json({ success: true, data: listings });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

marketRouter.get('/my-offers', async (req: Request, res: Response) => {
  try {
    const offers = await marketService.getMyOffers(req.user!.userId);
    res.json({ success: true, data: offers });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});
