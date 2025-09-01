import { COINGECKO } from "../config.js";

function baseUrl() {
  return COINGECKO.MODE === "pro" ? COINGECKO.PRO_BASE_URL : COINGECKO.BASE_URL;
}

function authHeaders() {
  const headers = { Accept: "application/json" };
  if (COINGECKO.MODE === "demo" && COINGECKO.API_KEY) {
    headers["x-cg-demo-api-key"] = COINGECKO.API_KEY; // demo key
  }
  if (COINGECKO.MODE === "pro" && COINGECKO.API_KEY) {
    headers["x-cg-pro-api-key"] = COINGECKO.API_KEY;  // pro key
  }
  return headers;
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

  const url = new URL(`${baseUrl()}/coins/markets`);
  url.searchParams.set("vs_currency", COINGECKO.VS_CURRENCY);
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  url.searchParams.set("price_change_percentage", "24h");

  const res = await fetch(url.toString(), { headers: authHeaders() });
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
  const url = new URL(`${baseUrl()}/search/trending`);
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} @ /search/trending :: ${text.slice(0,180)}`);
  }
  const data = await res.json();
  // Normalize to ids list when possible
  const ids = (data?.coins || []).map(x => x?.item?.id).filter(Boolean);
  return ids;
}
