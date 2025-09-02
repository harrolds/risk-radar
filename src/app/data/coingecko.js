import { COINGECKO } from "../config.js";

// Simple session cache with TTL
function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (Date.now() - obj.t > COINGECKO.CACHE_TTL_MS) return null;
    return obj.v;
  } catch { return null; }
}
function cacheSet(key, v) {
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch {}
}

// Resilient fetch with small retry/backoff
async function _request(url) {
  let attempt = 0;
  const max = 3;
  while (true) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.status === 429 && attempt < max) {
        await new Promise(r => setTimeout(r, 400 * Math.pow(2, attempt++)));
        continue;
      }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (attempt >= max) throw e;
      await new Promise(r => setTimeout(r, 300 * Math.pow(2, attempt++)));
    }
  }
}

/** Markets (paginated) used on Coins page and Home enrich */
export async function fetchCoinsMarkets({ page = 1, perPage = 250, order = 'market_cap_desc', ids = null } = {}){
  const u = new URL(`${COINGECKO.CG_PROXY}`);
  u.searchParams.set('endpoint', 'coins_markets');
  u.searchParams.set('vs_currency', COINGECKO.VS_CURRENCY);
  u.searchParams.set('order', order);
  u.searchParams.set('per_page', String(perPage));
  u.searchParams.set('page', String(page));
  if (ids && ids.length) u.searchParams.set('ids', ids.join(','));
  u.searchParams.set('_t', String(Date.now()));

  const cacheKey = 'mk:' + u.toString();
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const data = await _request(u.toString());
  const mapped = (data || []).map(x => ({
    id: x.id,
    symbol: x.symbol,
    name: x.name,
    image: x.image,
    current_price: x.current_price,
    price_change_percentage_24h: x.price_change_percentage_24h,
    market_cap_rank: x.market_cap_rank,
  }));
  cacheSet(cacheKey, mapped);
  return mapped;
}

/** Trending returns array of coin IDs */
export async function fetchTrending(){
  const u = new URL(`${COINGECKO.CG_PROXY}`);
  u.searchParams.set('endpoint', 'search_trending');
  u.searchParams.set('_t', String(Date.now()));
  const cacheKey = 'tr:' + u.toString();
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const data = await _request(u.toString());
  const ids = (data?.coins || []).map(c => c?.item?.id).filter(Boolean);
  cacheSet(cacheKey, ids);
  return ids;
}

/** Batch markets by IDs (used for incremental refresh) */
export async function fetchMarketsByIds(ids = []){
  if (!ids || !ids.length) return [];
  const u = new URL(`${COINGECKO.CG_PROXY}`);
  u.searchParams.set('endpoint', 'coins_markets');
  u.searchParams.set('vs_currency', COINGECKO.VS_CURRENCY);
  u.searchParams.set('ids', ids.join(','));
  u.searchParams.set('price_change_percentage', '24h');
  u.searchParams.set('_t', String(Date.now()));

  const data = await _request(u.toString());
  return (data || []).map(x => ({
    id: x.id,
    current_price: x.current_price,
    price_change_percentage_24h: x.price_change_percentage_24h,
  }));
}
