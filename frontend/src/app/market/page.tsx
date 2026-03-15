'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NavBar } from '@/components/NavBar';

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'border-gray-500', RARE: 'border-blue-500',
  EPIC: 'border-purple-500', LEGENDARY: 'border-yellow-500', MYTHIC: 'border-red-500',
};

const RARITY_BG: Record<string, string> = {
  COMMON: 'bg-gray-800', RARE: 'bg-blue-900/50',
  EPIC: 'bg-purple-900/50', LEGENDARY: 'bg-yellow-900/50', MYTHIC: 'bg-red-900/50',
};

const TYPE_ICONS: Record<string, string> = { WEAPON: '🗡️', ARMOR: '🛡️', SPELL: '✨' };
const TRAIT_ICONS: Record<string, string> = {
  BURN: '🔥', FREEZE: '❄️', LIGHTNING: '⚡', SHADOW: '👻', HEAL: '💚', POISON: '🧪',
};

type Tab = 'browse' | 'my-listings' | 'my-offers';

export default function MarketPage() {
  const [tab, setTab] = useState<Tab>('browse');
  const [listings, setListings] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (tab === 'browse') loadListings();
    else if (tab === 'my-listings') loadMyListings();
    else loadMyOffers();
  }, [tab, filters]);

  async function loadListings() {
    setLoading(true);
    try {
      const result = await api.searchListings(filters);
      setListings(result.listings);
      setTotal(result.total);
    } catch (e: any) { setMessage(e.message); }
    setLoading(false);
  }

  async function loadMyListings() {
    try { setMyListings(await api.getMyListings()); } catch {}
  }

  async function loadMyOffers() {
    try { setMyOffers(await api.getMyOffers()); } catch {}
  }

  async function handleBuy(id: string) {
    try {
      await api.buyListing(id);
      setMessage('Achat reussi !');
      loadListings();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleOffer(id: string) {
    const price = prompt('Votre offre ?');
    if (!price) return;
    try {
      await api.makeOffer(id, Number(price));
      setMessage('Offre envoyee !');
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleCancel(id: string) {
    try {
      await api.cancelListing(id);
      setMessage('Listing annule');
      loadMyListings();
    } catch (e: any) { setMessage(e.message); }
  }

  async function handleRespondOffer(offerId: string, accept: boolean) {
    try {
      await api.respondToOffer(offerId, accept);
      setMessage(accept ? 'Offre acceptee !' : 'Offre refusee');
      loadMyListings();
    } catch (e: any) { setMessage(e.message); }
  }

  return (
    <main className="min-h-screen text-white pb-20 p-4 relative">
      <div className="fixed inset-0 -z-10">
        <img src="/assets/backgrounds/bg-market.png" alt="" className="w-full h-full object-cover" />
      </div>
      <h1 className="text-2xl font-bold text-center mb-4">🏪 Marketplace</h1>

      {message && (
        <div className="bg-blue-900/50 border border-blue-500 rounded p-2 mb-4 text-center text-sm">
          {message}
          <button onClick={() => setMessage('')} className="ml-2 text-gray-400">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['browse', 'my-listings', 'my-offers'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded text-sm font-medium ${
              tab === t ? 'bg-yellow-600' : 'bg-gray-700'
            }`}
          >
            {t === 'browse' ? 'Parcourir' : t === 'my-listings' ? 'Mes ventes' : 'Mes offres'}
          </button>
        ))}
      </div>

      {/* Filters (browse only) */}
      {tab === 'browse' && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <select
            className="bg-gray-700 rounded px-2 py-1 text-sm"
            onChange={e => setFilters(f => ({ ...f, rarity: e.target.value || '' }))}
          >
            <option value="">Rarete</option>
            {['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            className="bg-gray-700 rounded px-2 py-1 text-sm"
            onChange={e => setFilters(f => ({ ...f, trait: e.target.value || '' }))}
          >
            <option value="">Trait</option>
            {['BURN', 'FREEZE', 'LIGHTNING', 'SHADOW', 'HEAL', 'POISON'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            className="bg-gray-700 rounded px-2 py-1 text-sm"
            onChange={e => setFilters(f => ({ ...f, sort: e.target.value || '' }))}
          >
            <option value="newest">Plus recents</option>
            <option value="price_asc">Prix ↑</option>
            <option value="price_desc">Prix ↓</option>
          </select>
        </div>
      )}

      {/* Browse listings */}
      {tab === 'browse' && (
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-gray-400">Chargement...</p>
          ) : listings.length === 0 ? (
            <p className="text-center text-gray-400">Aucun listing</p>
          ) : listings.map(listing => (
            <div key={listing.id} className={`border rounded-lg p-3 ${RARITY_COLORS[listing.item.rarity]} ${RARITY_BG[listing.item.rarity]}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{TYPE_ICONS[listing.item.type]} {TRAIT_ICONS[listing.item.trait]}</span>
                  <div>
                    <span className="text-sm font-bold">{listing.item.rarity}</span>
                    <span className="text-xs text-gray-400 ml-2">+{listing.item.bonusDamage} dmg</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold">
                    {listing.price} {listing.currency === 'GOLD' ? '🪙' : '💎'}
                  </div>
                  <div className="text-xs text-gray-400">
                    par {listing.seller?.displayName || listing.seller?.username || 'Anonyme'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleBuy(listing.id)}
                  className="flex-1 bg-green-600 hover:bg-green-500 rounded py-1 text-sm"
                >
                  Acheter
                </button>
                <button
                  onClick={() => handleOffer(listing.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 rounded py-1 text-sm"
                >
                  Offrir
                </button>
              </div>
            </div>
          ))}
          {total > 20 && (
            <p className="text-center text-gray-400 text-sm">{total} listings au total</p>
          )}
        </div>
      )}

      {/* My listings */}
      {tab === 'my-listings' && (
        <div className="space-y-3">
          {myListings.length === 0 ? (
            <p className="text-center text-gray-400">Aucune vente en cours</p>
          ) : myListings.map(listing => (
            <div key={listing.id} className={`border rounded-lg p-3 ${RARITY_COLORS[listing.item.rarity]} ${RARITY_BG[listing.item.rarity]}`}>
              <div className="flex items-center justify-between">
                <span>{TYPE_ICONS[listing.item.type]} {TRAIT_ICONS[listing.item.trait]} {listing.item.rarity}</span>
                <span className="text-yellow-400 font-bold">
                  {listing.price} {listing.currency === 'GOLD' ? '🪙' : '💎'}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {listing._count?.offers || 0} offre(s) en attente
              </div>
              <button
                onClick={() => handleCancel(listing.id)}
                className="w-full mt-2 bg-red-600 hover:bg-red-500 rounded py-1 text-sm"
              >
                Annuler
              </button>
            </div>
          ))}
        </div>
      )}

      {/* My offers */}
      {tab === 'my-offers' && (
        <div className="space-y-3">
          {myOffers.length === 0 ? (
            <p className="text-center text-gray-400">Aucune offre en cours</p>
          ) : myOffers.map(offer => (
            <div key={offer.id} className="border border-gray-600 rounded-lg p-3 bg-gray-800">
              <div className="flex items-center justify-between">
                <span>
                  {TYPE_ICONS[offer.listing.item.type]} {TRAIT_ICONS[offer.listing.item.trait]} {offer.listing.item.rarity}
                </span>
                <div className="text-right">
                  <div className="text-yellow-400">{offer.offerPrice} {offer.listing.currency === 'GOLD' ? '🪙' : '💎'}</div>
                  <div className={`text-xs ${
                    offer.status === 'PENDING' ? 'text-blue-400' :
                    offer.status === 'ACCEPTED' ? 'text-green-400' : 'text-red-400'
                  }`}>{offer.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NavBar />
    </main>
  );
}
