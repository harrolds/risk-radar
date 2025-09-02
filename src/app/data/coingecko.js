import { COINGECKO } from "../config.js";

function baseUrl() {
  return COINGECKO.MODE === "pro" ? COINGECKO.PRO_BASE_URL : COINGECKO.BASE_URL;
}

function {} {
  const headers = { Accept: "application/json" };
  if (COINGECKO.MODE === "demo" && COINGECKO.API_KEY) {
    headers["x-cg-demo-api-key"] = COINGECKO.API_KEY; // demo key
  }
  if (COINGECKO.MODE === "pro" && COINGECKO.API_KEY) {
    headers["x-cg-pro-api-key"] = COINGECKO.API_KEY;  // pro key
  }
  return headers;
}

async function _request(url, opts={}){
  let attempt=0;
  const max=3;
  while(true){
    try{
      const res = await fetch(url, { cache: 'no-store', ...opts });
      if (res.status===429 && attempt<max){ await new Promise(r=>setTimeout(r, 400 * Math.pow(2, attempt++))); continue; }
      if (!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    }catch(e){
      if (attempt>=max) throw e;
      await new Promise(r=>setTimeout(r, 300 * Math.pow(2, attempt++)));
    }
  }
}

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

/** Haal markt-data op (naam, symbool, prijs, 24h %) — voor CoinsPage */
export async function fetchCoinsMarkets({ page = 1, perPage = 250 } = {}) {
  const key = `cg_markets_${COINGECKO.VS_CURRENCY}_${page}_${perPage}_${COINGECKO.MODE}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const url = new URL(`${COINGECKO.CG_PROXY}?endpoint=coins_markets`);
  url.searchParams.set("vs_currency", COINGECKO.VS_CURRENCY);
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  url.searchParams.set("price_change_percentage", "24h");

  url.searchParams.set("_t", Date.now());
  const res = await fetch(url.toString(), { headers: {}, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} @ /coins/markets :: ${text.slice(0,180)}`);
  }
  const data = await res.json();
  // normalize subset
  const list = data.map(x => ({
    id: x.id,
    name: x.name,
    symbol: x.symbol?.toUpperCase?.() ?? "",
    image: x.image,
    current_price: x.current_price,
    price_change_percentage_24h: x.price_change_percentage_24h,
  }));
  cacheSet(key, list);
  return list;
}


/** CoinGecko 'search/trending' — returns list of trending coins (ids) */
export async function fetchTrending() {
  const url = new URL(`${COINGECKO.CG_PROXY}?endpoint=search_trending`);
  url.searchParams.set("_t", Date.now());
  const res = await fetch(url.toString(), { headers: {}, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} @ /search/trending :: ${text.slice(0,180)}`);
  }
  const data = await res.json();
  // Normalize to ids list when possible
  const ids = (data?.coins || []).map(x => x?.item?.id).filter(Boolean);
  return ids;
}

/** Fetch markets for specific coin IDs (batch) */
export async function fetchMarketsByIds(ids = []){
  if (!ids || ids.length === 0) return [];
  const url = new URL(`${COINGECKO.CG_PROXY}?endpoint=coins_markets`);
  url.searchParams.set("vs_currency", COINGECKO.VS_CURRENCY);
  url.searchParams.set("ids", ids.join(","));
  url.searchParams.set("price_change_percentage", "24h");
  url.searchParams.set("_t", Date.now());
  const data = await _request(url.toString(), { headers: {} });
  return data.map(x => ({
    id: x.id,
    current_price: x.current_price,
    price_change_percentage_24h: x.price_change_percentage_24h,
  }));
}
